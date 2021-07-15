// - 換 size 之後，斷行的位置要跟著自適應改變☑️
//   - 如果 overflow 被觸發, 自然換行的 \n 會被記錄下來☑️

// @ts-check
const { useRef, useEffect, useState, useMemo } = React

// 不希望觸發 re-render 的變數
let currentRows = 0
const fontSettings = [
  { name: '小', fontSize: 16, lineHeight: 16 * 1.2 },
  { name: '中', fontSize: 24, lineHeight: 24 * 1.2 },
  { name: '大', fontSize: 36, lineHeight: 36 * 1.2 },
]

// React Components
// =======================

/** @type {React.FC<{ onChangeSize: (size: number) => void }>} */
const FontSizeBtn = (props) => {
  const handleClick = (e) => {
    if (!e.target.matches('.btn')) return void 0

    const btn = e.target
    props.onChangeSize(+btn.dataset.size)
  }

  return (
    <div className="d-flex justify-content-between mt-2" onClick={handleClick}>
      <div className="btn btn-primary" data-size="0">
        font: 小
      </div>
      <div className="btn btn-primary" data-size="1">
        font: 中
      </div>
      <div className="btn btn-primary" data-size="2">
        font: 大
      </div>
    </div>
  )
}

const Main = () => {
  /** @type {React.MutableRefObject<HTMLFormElement>} */
  const textForm = useRef(null)
  /** @type {React.MutableRefObject<HTMLTextAreaElement>} */
  const textEditor = useRef(null)
  const [fontInfo, setFontInfo] = useState(fontSettings[2])
  const [maxRow, setMaxRow] = useState(Infinity)

  /** @param {number} currentMaxRow */
  const updateContent = (currentMaxRow) => {
    // 檢查行數, 去除超出者
    // 用迴圈是為了批次將超出部分的重複字段去除
    while (true) {
      // 用 formData 格式化, 使其匹配 UI 自動換行
      const formTxt = getFormText(textForm.current)
      currentRows = formTxt.split('\n').length
      const isOverflow = currentRows > currentMaxRow
      if (!isOverflow) break

      const cardValue = textEditor.current.value
      const newText = removeOverflow(cardValue, formTxt, currentMaxRow)
      textEditor.current.value = newText
    }
  }

  /** @param {number} sizeIndex */
  const changeSize = (sizeIndex) => {
    setFontInfo({
      ...fontInfo,
      ...fontSettings[sizeIndex],
    })
  }

  /**
   * 行數達 maxRow 則阻擋 Enter
   * @param {React.KeyboardEvent} e
   */
  const preventEnter = (e) => {
    if (currentRows >= maxRow && e.key === 'Enter') {
      e.preventDefault()
    }
  }

  useEffect(() => {
    const oldMaxRow = maxRow

    // calc maxRow
    const textEditorHeight = textEditor.current.clientHeight
    const lineHeight = fontInfo.lineHeight
    const newMaxRow = Math.round(textEditorHeight / lineHeight)
    setMaxRow(newMaxRow)

    // 換到大的 fontSize, 進行 remove overflow
    if (newMaxRow < oldMaxRow) updateContent(newMaxRow)
  }, [fontInfo])

  return (
    <>
      <h1>Textarea 2</h1>
      <div className="">
        <div className="position-relative">
          <div className="bg">fake bg img</div>
          <div className="text-warper p-4">
            <textarea
              className="text-editor"
              style={{ fontSize: `${fontInfo.fontSize}px`, lineHeight: `${fontInfo.lineHeight}px` }}
              placeholder="Please enter the content..."
              wrap="hard"
              name="textEditor"
              form="textForm"
              ref={textEditor}
              onChange={() => updateContent(maxRow)}
              onKeyDown={preventEnter}
              onBlur={(e) => trimText(e.target)}></textarea>
            <form id="textForm" className="d-none" ref={textForm}></form>
          </div>
        </div>
        <FontSizeBtn onChangeSize={changeSize} />
        <div className="alert alert-info mt-3 text-center">{`fontSize=${fontInfo.name}　|　maxRow=${maxRow}`}</div>
      </div>
    </>
  )
}

// @ts-ignore
ReactDOM.render(<Main />, document.querySelector('#app'))

// Helper Function
// =======================
function getFormText(form) {
  const formData = new FormData(form)
  /** @type {string} */
  const text = (formData.get('textEditor'))
  return text.replace(/\r/g, '') // line break 統一為 "\n"
}

/**
 * @param {string} oriValue 
 * @param {string} formText 
 * @param {number} maxRow 
 */
function removeOverflow(oriValue, formText, maxRow) {
  // 用 formData 的值, 轉換成陣列取得超出 maxRows 的部分
  const textArray = formText.trimEnd().split('\n')
  const cutArray = textArray.splice(maxRow)

  // 取得超出部分的第一行 text
  const cutTextFirst = cutArray[0]

  // 從原始 val 中, 找出超出部分第一行字段的 index
  // 正規 match last occurrence, /(word)(?!.*\1)/
  // 正規 modifiers \s 表示讓 "." 也匹配 "\n"
  const reg = new RegExp(`(${cutTextFirst})(?!.*\\1)`, 's')
  const cutIndex = oriValue.search(reg)

  // 從原始 val 剪去超出部分
  return oriValue.slice(0, cutIndex).trimEnd()
}

/**
 * 去尾部空白
 * @param {HTMLTextAreaElement} textarea
 */
function trimText(textarea) {
  const trimText = textarea.value.trimEnd()
  textarea.value = trimText
}
