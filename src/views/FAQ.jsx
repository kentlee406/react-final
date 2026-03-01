import "bootstrap";

function FAQ() {
  const faqItems = [
    {
      id: "one",
      question: "如何開始購物與下單？",
      answer:
        "請先瀏覽商品頁並加入購物車，確認數量與規格後前往結帳頁，填寫收件資訊並完成付款即可成立訂單。",
    },
    {
      id: "two",
      question: "一定要註冊會員才能購買嗎？",
      answer:
        "目前可依網站流程進行下單，若建立會員可更快速查看訂單紀錄與管理常用收件資料。",
    },
    {
      id: "three",
      question: "有哪些付款方式？",
      answer:
        "目前只接受貨到付款，未來將陸續開放信用卡、行動支付等多元付款選項，敬請期待！",
    },
    {
      id: "four",
      question: "下單後多久會出貨？",
      answer:
        "一般商品會在付款完成後 3-7 個工作天安排出貨；若遇到預購或特殊活動檔期，出貨時間可能延長。",
    },
    {
      id: "five",
      question: "如何查詢訂單進度？",
      answer:
        "訂單成立後可透過訂單頁面或通知訊息追蹤狀態，包含待出貨、配送中與已送達等階段。",
    },
    {
      id: "six",
      question: "配送需要多久才會到貨？",
      answer:
        "通常出貨後約 2-3 個工作天可送達（偏遠地區與離島除外）；實際時間依物流作業與天候狀況調整。",
    },
    {
      id: "seven",
      question: "可以指定到貨時段或修改地址嗎？",
      answer:
        "若訂單尚未出貨，通常可聯繫客服協助調整收件資訊；一旦進入物流配送階段，請依物流端規則處理。",
    },
    {
      id: "eight",
      question: "收到商品有瑕疵或缺件怎麼辦？",
      answer:
        "請於收到商品後盡快拍照並聯繫客服，提供訂單編號與問題說明，我們會協助後續換貨或補件流程。",
    },
    {
      id: "nine",
      question: "可以退貨或取消訂單嗎？",
      answer:
        "在符合消費者保護法與平台規範的前提下可申請退貨；若訂單尚未出貨，通常可先提出取消申請。",
    },
    {
      id: "ten",
      question: "發票與保固如何處理？",
      answer:
        "發票會依結帳資訊開立；保固範圍與期限依商品品牌與型號不同，建議保留購買憑證以利後續保固服務。",
    },
  ];

  return (
    <main className="container py-4 py-md-5">
      <section className="mb-4">
        <h1 className="fw-bold mb-2">常見問題</h1>
        <p className="text-secondary mb-0">
          整理下單、付款、配送與售後常見疑問，方便你快速查詢。
        </p>
      </section>

      <section>
        <div className="accordion" id="faqAccordion">
          {faqItems.map((item, index) => (
            <div className="accordion-item" key={item.id}>
              <h2 className="accordion-header" id={`heading-${item.id}`}>
                <button
                  className={`accordion-button ${index === 0 ? "" : "collapsed"}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse-${item.id}`}
                  aria-expanded={index === 0 ? "true" : "false"}
                  aria-controls={`collapse-${item.id}`}
                >
                  <strong>{item.question}</strong>
                </button>
              </h2>
              <div
                id={`collapse-${item.id}`}
                className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                aria-labelledby={`heading-${item.id}`}
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">{item.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default FAQ;
