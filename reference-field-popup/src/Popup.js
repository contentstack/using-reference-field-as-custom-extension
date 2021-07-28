import React from "react";
import Modal from "./components/modal";

export class Popup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "",
      config: undefined,
      referenceTo: undefined,
      entries: [],
      searchResult: [],
      loadmoreResult: [],
      selectedRefEntries: [],
    };
    this.onCloseWindow = this.onCloseWindow.bind(this);
  }

  componentDidMount() {
    // this route should only be availble from a popup
    if (!window.opener) {
      window.close();
    }
    window.opener.postMessage(
      { message: "get config and selected entries", getConfig: true },
      "*"
    );
    const receiveMessage = ({ data }) => {
      if (data.config) {
        this.setState({
          message: data.message,
          config: data.config,
          referenceTo: data.referenceTo,
        });
      }
      if (data.selectedRefEntries) {
        this.setState({
          message: data.message,
          selectedRefEntries: data.selectedRefEntries,
        });
      }
      if (data.entries) {
        this.setState({
          message: data.message,
          entries: data.entries
        })
      }
      if (data.loadmoreResult) {
        this.setState({
          message: data.message,
          loadmoreResult: data.loadmoreResult
        })
      }
      if (data.searchResult) {
        this.setState({
          message: data.message,
          searchResult: data.searchResult
        })
      }
    };
    window.addEventListener("message", receiveMessage, false);
  }

  onCloseWindow = (selectedEntries) => {
    selectedEntries.length > 0
      ? window.opener.postMessage(
        {
          message: "sending selected entries",
          selectedRefEntries: selectedEntries,
        },
        "*"
      )
      : window.opener.postMessage(
        {
          message: "Window closed sending selected entries",
        },
        "*"
      );
    window.close();
  };

  render() {
    const { config, referenceTo, entries, searchResult, loadmoreResult, message, selectedRefEntries } = this.state;

    return (
      <div>
        {config && (
          <Modal
            config={config}
            referenceTo={referenceTo}
            entries={entries}
            message={message}
            searchResult={searchResult}
            loadmoreResult={loadmoreResult}
            closeWindow={this.onCloseWindow}
            selectedRefEntries={selectedRefEntries}
          />
        )}
      </div>
    );
  }
}
