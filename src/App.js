import "regenerator-runtime/runtime"
import React from "react"
import { login, logout } from "./utils"
import "./global.css"

import getConfig from "./config"
const { networkId } = getConfig(process.env.NODE_ENV || "development")

export default function App() {
  // use React Hooks to store greeting in component state
  const [title, set_title] = React.useState()

  const [description, set_description] = React.useState()

  const [yes_vote, set_yes_vote] = React.useState()

  const [no_vote, set_no_vote] = React.useState()

  const [vote_result, set_vote_result] = React.useState()

  const [vote_select, set_vote_select] = React.useState()

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = React.useState(false)

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(
    async () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {
        // window.contract is set by initContract in index.js
        try {
          var _title = await window.contract.get_title({
            account_id: window.accountId,
          })
          set_title(_title)

          var _description = await window.contract.get_description({
            account_id: window.accountId,
          })

          set_description(_description)
          var _yes_vote = await window.contract.get_yes_vote({
            account_id: window.accountId,
          })

          set_yes_vote(_yes_vote)

          var _no_vote = await window.contract.get_no_vote({
            account_id: window.accountId,
          })

          set_no_vote(_no_vote)
          var _vote_result = await window.contract.get_vote_result({
            account_id: window.accountId,
          })
          set_vote_result(_vote_result)
        } catch (error) {
          console.log("获取数据失败")
          console.log(error)
        }
      }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
  )

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>欢迎来到区块链投票系统!</h1>
        <p>我们每天都会发布提案,所有用户都可以针对提案进行投票</p>
        <p>一人一票,不能修改,请谨慎对待您的投票权</p>
        <p>点击下方登录按钮进行下一步</p>
        <p style={{ textAlign: "center", marginTop: "2.5em" }}>
          <button onClick={login}>登录</button>
        </p>
      </main>
    )
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button className="link" style={{ float: "right" }} onClick={logout}>
        Sign out
      </button>
      <main>
        <h1>
          <label
            htmlFor="greeting"
            style={{
              fontSize: 18,
              color: "var(--secondary)",
            }}
          >
            {"欢迎访问投票系统"}
          </label>
        </h1>

        <div
          style={{
            padding: 10,
            borderStyle: "solid",
            borderWidth: 1,
            borderColor: "white",
          }}
        >
          <div style={{ justifyContent: "center" }}>
            <p style={{ textAlign: "center" }}>{"今日议题:" + title}</p>
          </div>

          <div style={{ justifyContent: "center" }}>
            <h6 style={{ textAlign: "center", color: "gray" }}>
              {description}
            </h6>
          </div>

          <div style={{ justifyContent: "center" }}>
            <h6 style={{ textAlign: "center", color: "green" }}>
              {"赞成票数: " + yes_vote}
            </h6>
          </div>

          <div style={{ justifyContent: "center" }}>
            <h6 style={{ textAlign: "center", color: "red" }}>
              {"反对票数: " + no_vote}
            </h6>
          </div>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => {
                set_vote_select(1)
              }}
              style={{
                margin: 10,
                backgroundColor: vote_select == 1 ? "green" : "grey",
              }}
            >
              赞成
            </button>
            <button
              onClick={() => {
                set_vote_select(2)
              }}
              style={{
                margin: 10,
                backgroundColor: vote_select == 2 ? "red" : "grey",
              }}
            >
              反对
            </button>
          </div>
          <div
            style={{ display: "flex", margin: 10, justifyContent: "center" }}
          >
            <fieldset id="fieldset">
              <button
                onClick={async () => {
                  if (vote_result != 0) {
                    return
                  }

                  console.log("开始调用合约")
                  // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
                  // let intVote = vote_select
                  // console.log(intVote, "intVote")
                  // disable the form while the value gets updated on-chain
                  fieldset.disabled = true
                  try {
                    // make an update call to the smart contract
                    var result = await window.contract.set_vote({
                      vote: vote_select,
                    })
                    console.log(result)
                  } catch (e) {
                    alert(
                      "Something went wrong! " +
                        "Maybe you need to sign out and back in? " +
                        "Check your browser console for more info."
                    )
                    console.log(e)
                    throw e
                  } finally {
                    fieldset.disabled = false
                  }
                  // update local `greeting` variable to match persisted value
                  var _yes_vote = await window.contract.get_yes_vote({
                    account_id: window.accountId,
                  })
                  set_yes_vote(_yes_vote)
                  var _no_vote = await window.contract.get_no_vote({
                    account_id: window.accountId,
                  })
                  set_no_vote(_no_vote)
                  // show Notification
                  setShowNotification(true)
                  // remove Notification again after css animation completes
                  // this allows it to be shown again next time the form is submitted
                  setTimeout(() => {
                    setShowNotification(false)
                  }, 11000)
                }}
                style={{ borderRadius: "5px 5px 5px 5px", width: "180px" }}
              >
                {vote_result != 0
                  ? vote_result == 1
                    ? "已赞成"
                    : "已拒绝"
                  : "投票"}
              </button>
            </fieldset>
          </div>
        </div>
      </main>
      {showNotification && <Notification />}
    </>
  )
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
  return (
    <aside>
      <a
        target="_blank"
        rel="noreferrer"
        href={`${urlPrefix}/${window.accountId}`}
      >
        {window.accountId}
      </a>
      {
        " " /* React trims whitespace around tags; insert literal space character when needed */
      }
      called method: 'set_greeting' in contract:{" "}
      <a
        target="_blank"
        rel="noreferrer"
        href={`${urlPrefix}/${window.contract.contractId}`}
      >
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  )
}
