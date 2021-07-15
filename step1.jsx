// - 要限制文字輸入不能超出範圍☑️
//   - remove overflow☑️
//     - 換大 size 之後，自動移除 overflow ☑️
//   - 計算 maxRow☑️
//     - overflow: hidden 要開, 不然超出瞬間會多扣字元💡
//     - 要擋 enter, 不然在前面 enter 最後一行會不見💡
// - 文字是可以換大、中、小三種 size 的☑️
// - 不能用 formText 雙綁💡
//   - 輸入注音在自然換行處會出錯, 兩種解法💡
//   - 換 size 之後，斷行的位置無法自適應改變💡

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
  const [content, setContent] = useState('')
  const [fontInfo, setFontInfo] = useState(fontSettings[2])
  const [maxRow, setMaxRow] = useState(Infinity)

  /** @param {number} currentMaxRow */
  const updateContent = (currentMaxRow) => {
    const formText = getFormText(textForm.current)
    currentRows = formText.split('\n').length
    if (currentRows > currentMaxRow) {
      const newText = removeOverflow(formText, currentMaxRow)
      setContent(newText)
    } else {
      setContent(formText)
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

  /** 去尾部空白 */
  const trimText = () => {
    setContent(content.trimEnd())
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
      <h1>Textarea 1</h1>
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
              value={content}
              onChange={() => updateContent(maxRow)}
              onKeyDown={preventEnter}
              onBlur={trimText}></textarea>
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

function removeOverflow(text, maxRow) {
  return text.split('\n').slice(0, maxRow).join('\n')
}
