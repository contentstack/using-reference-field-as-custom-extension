import React from "react";
import ListLayout from "./listLayout";
import "../styles/modal.css";

export default class Modal extends React.PureComponent {
  constructor() {
    super();
    this.extension = {};
    this.state = {
      isSelected: false,
      searchQuery: "",
      entries: [],
      initialEntries: [],
      count: 0,
      skip: {},
      selectedRefEntries: [],
      isLoading: true,
      searchMsg: false,
      selectedRef: undefined
    };
    this.loadMore = this.loadMore.bind(this);
    this.selectingRefEntries = this.selectingRefEntries.bind(this);
    this.fetchQuery = this.fetchQuery.bind(this);
    this.searchQueryHandler = this.searchQueryHandler.bind(this);
  }

  selectingRefEntries = (selectedEntries) => {
    const { selectedRefEntries } = this.state;
    const checkList = selectedRefEntries.some(
      (entry) => entry.uid === selectedEntries.uid
    );
    if (checkList) {
      selectedRefEntries.splice(
        selectedRefEntries.findIndex(
          (index) => index.uid === selectedEntries.uid
        ),
        1
      );
      this.setState({
        selectedRefEntries: [...selectedRefEntries]
      });
    } else {
      const newlist = [...selectedRefEntries];
      newlist.push(selectedEntries);
      this.setState({ selectedRefEntries: newlist });
    }
  };

  componentDidMount() {
    const { referenceTo } = this.props;
    let { skip } = this.state;

    referenceTo.forEach((reference) => {
      skip[reference] = 0;
    });

    this.setState({
      referenceTo: referenceTo,
      selectedRef: referenceTo[0]
    });

    window.opener.postMessage({ message: 'add', skip: skip, selectedRef: referenceTo[0] }, '*');

    this.setState(prevState => ({
      skip: {
        ...prevState.skip,
        [referenceTo[0]]: skip[referenceTo[0]] + 10
      }
    }))
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    const { selectedRefEntries } = this.props;

    if (newProps.selectedRefEntries !== selectedRefEntries) {
      this.setState({
        selectedRefEntries: newProps.selectedRefEntries,
      });
    }

    if (newProps.entries.count > 0) {
      this.setState({
        entries: newProps.entries.entries,
        count: newProps.entries.count,
        initialEntries: newProps.entries.entries,
        initialCount: newProps.entries.count,
        searchMsg: false,
        isLoading: false
      })
    }
    else {
      setTimeout(() => {
        this.setState({ searchMsg: true });
      }, 1000)
      this.setState({
        isLoading: false
      });
    }

    if (newProps.message === 'searchResult' && newProps.searchResult.count >= 0) {
      this.setState({
        entries: newProps.searchResult.entries,
        count: newProps.searchResult.count
      })

      if (newProps.searchResult.count === 0) {
        this.setState({
          searchMsg: true,
          isLoading: false
        });
      }
    }

    if (newProps.message === 'loadmoreResult' && newProps.loadmoreResult.count > 0) {
      this.setState({
        entries: this.state.entries.concat(newProps.loadmoreResult.entries)
      })

      if (this.state.skip[this.state.selectedRef] > this.state.count) {
        document.getElementById('loadMore').style.display = 'none'
      }
    }
  }

  loadMore = () => {
    let { skip, count, selectedRef } = this.state;

    if (skip[selectedRef] <= count) {
      window.opener.postMessage({ message: 'loadmore', skip: skip, selectedRef: selectedRef }, '*');

      this.setState(prevState => ({
        skip: {
          ...prevState.skip,
          [selectedRef]: skip[selectedRef] + 10
        }
      }))
    }
  };

  sendAndClose = (closeandsend) => {
    const { selectedRefEntries } = this.state;
    closeandsend
      ? this.props.closeWindow(selectedRefEntries)
      : this.props.closeWindow([]);
  };

  showAllEntries = () => {
    this.setState((prevState) => ({
      isSelected: !prevState.isSelected,
    }));
  }

  showselectedEntries = () => {
    this.setState((prevState) => ({
      isSelected: !prevState.isSelected
    }));
  }

  searchQueryHandler = (event) => {
    let { selectedRef } = this.state;
    const query = event.target.value.toLowerCase();
    this.setState({ searchQuery: query });

    if (event.charCode === 13) {
      if (query !== '') {
        window.opener.postMessage({ message: 'search', query: query, selectedRef: selectedRef }, '*');
      } else {
        this.setState(prevState => ({
          entries: prevState.initialEntries,
          count: prevState.initialCount,
          skip: {
            ...prevState.skip,
            [selectedRef]: 10
          }
        }))
      }
    }
  };

  fetchQuery = () => {
    let { selectedRef } = this.state;
    let query = document.getElementById('search').value;

    if (query !== '') {
      window.opener.postMessage({ message: 'search', query: query, selectedRef: selectedRef }, '*');
    } else {
      this.setState(prevState => ({
        entries: this.state.initialEntries,
        count: this.state.initialCount,
        skip: {
          ...prevState.skip,
          [selectedRef]: 10
        }
      }))
    }
  };

  selectRef = (reference) => {
    let { skip } = this.state;

    this.props.referenceTo.forEach((reference) => {
      skip[reference] = 0;
    });

    this.setState(prevState => ({
      entries: [],
      initialEntries: [],
      count: 0,
      isLoading: true,
      searchMsg: true,
      selectedRef: reference,
      skip: {
        ...prevState.skip,
        [reference]: skip[reference] + 10
      }
    }))

    window.opener.postMessage({ message: 'add', skip: skip, selectedRef: reference }, '*');
  }

  render() {
    const { referenceTo, entries, count, selectedRefEntries, searchMsg, skip, selectedRef, isLoading } = this.state;

    return (
      <div className="modal display-block">
        <section className="modal-main">
          {this.props.children}
          <div className="modal-header">
            <h2>Choose Entries</h2>
          </div>
          <div className="search-bar">
            {this.state.isSelected ?
              <div className="show-selected-entries">
                <span>{selectedRefEntries.length} entries selected</span>
              </div>
              :
              <div className="form-grp">
                <div className="cs-pagination clearfix">
                  <div className="selected-filter" data-toggle="dropdown">
                    <span>
                      <span className="active-filter" title="Active">{selectedRef ? selectedRef : ''}</span>
                    </span>
                    <i className="icon-chevron-down"></i>
                  </div>
                  <div className="dropdown-menu select-controls">
                    <ul className="scroll-bar-design no-padding" id="filterList">
                      {referenceTo?.map((reference, index) => {
                        return (
                          <li key={index} onClick={() => this.selectRef(reference)} id="all" className="filter selected-option" value="active">
                            <label className="lbl dropdown-text-wrap">{reference}</label>
                          </li>
                        )
                      })}
                    </ul>
                  </div>

                </div>
                <div className="cs-form-group search-box no-margin">
                  <span className="search-input">
                    <input
                      type="search"
                      id="search"
                      className="cs-text-box cs-global-search"
                      placeholder="Search Entry"
                      onKeyPress={this.searchQueryHandler}
                    />
                  </span>
                  <span className="search-icon" onClick={this.fetchQuery}>
                    <i className="icon-search"></i>
                  </span>
                </div>
              </div>
            }
            <div className="ref-section">
              {this.state.isSelected ?
                <span className="select-count" onClick={this.showAllEntries}>
                  <i className="icon icon-angle-left"></i>Back to entries list
                </span>
                :
                <span className="select-count" onClick={this.showselectedEntries}>
                  Show selected entries({selectedRefEntries.length})
              </span>
              }
            </div>
          </div>
          <div className="modal-body">
            <ListLayout
              entries={entries && entries}
              isSelected={this.state.isSelected}
              loadContent={this.loadMore}
              handleSelect={this.selectingRefEntries}
              selectedRefEntries={selectedRefEntries}
              searchMsg={searchMsg}
              isLoading={isLoading}
              totalEntries={count && count}
              skip={skip && skip}
              selectedRef={selectedRef && selectedRef}
            />
            <div className="ref-section">
              {this.state.isSelected ? ''
                :
                <span className="ref-count">
                  showing {entries.length} of{" "}
                  {count} entries
              </span>}
            </div>
          </div>

          <div className="modal-footer">
            <div className="right">
              <button
                className="cancel-btn btn"
                onClick={() => this.sendAndClose(false)}
              >
                Cancel
              </button>
              <button
                className="add-btn btn"
                onClick={() => this.sendAndClose(true)}
              >
                <i className="icon-ok"></i>
                Add Selected Entries ({selectedRefEntries.length})
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
