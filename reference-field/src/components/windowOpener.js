import PropTypes from "prop-types";
import React from "react";
// Main Window.
let browser = null;
// child window.
let popup = null;
// interval
let timer = null;

// This function is what the name says.
// it checks whether the popup still open or not
function watcher() {
  // if popup is null then let's clean the intervals.
  if (popup === null) {
    clearInterval(timer);
    timer = null;
    // if popup is not null and it is not closed, then let's set the focus on it... maybe...
  } else if (popup !== null && !popup.closed) {
    popup.focus();
    // if popup is closed, then let's clean errthing.
  } else if (popup !== null && popup.closed) {
    clearInterval(timer);
    browser.focus();
    // the onCloseEventHandler it notifies that the child has been closed.
    browser.close({ message: "child was closed" });
    timer = null;
    popup = null;
  }
}

export class WindowOpener extends React.Component {
  constructor(props) {
    super(props);
    this.onClickHandler = this.onClickHandler.bind(this);
    // browser is set to current window
    browser = window.self;
  }
  // opens a child
  onClickHandler() {
    const { url, name, opts, refEntries } = this.props;
    // if there is  already a child open, let's set focus on it
    if (popup && !popup.closed) {
      popup.focus();

      return;
    }
    // we open a new window.
    popup = browser.open(url, name, opts);

    setTimeout(() => {
      // The opener object is created once and only if a window has a parent
      // popup.opener.onOpen({message:"Opening Reference Popup"});
      popup.opener.postMessage(
        { message: "Opening Reference Popup", selectedRefEntries: refEntries },
        "*"
      );
    }, 0);

    if (timer === null) {
      // each two seconds we check if the popup still open or not
      timer = setInterval(watcher, 2000);
    }

    return;
  }

  render() {
    const { children } = this.props;
    return (
      <button
        className="choose_btn"
        type="choose_btn"
        onClick={this.onClickHandler}
      >
        {children}
      </button>
    );
  }
}

WindowOpener.propTypes = {
  url: PropTypes.string.isRequired,
  bridge: PropTypes.func.isRequired,
  name: PropTypes.string,
  opts: PropTypes.string,
};
WindowOpener.defaultProps = {
  name: "Reference Popup",
  opts: `dependent=${1}, alwaysOnTop=${0}, alwaysRaised=${1}, width=${800}, height=${590}, left=${250}, top=${120}`,
};
