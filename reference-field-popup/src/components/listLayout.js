import React from "react";
import Loader from "./loader";
import moment from "moment";
import "../styles/modal.css";

export default class ListLayout extends React.PureComponent {
  render() {
    const { entries, isSelected, selectedRefEntries, handleSelect, loadContent, searchMsg, totalEntries, skip, selectedRef, isLoading } = this.props;
    let renderEntries = isSelected ? selectedRefEntries : entries;

    return (
      <ul className="list-layout">
        <li className="table-head">
          <div className="table-cell w-5"></div>
          <div className="table-cell w-32">Name</div>
          <div className="table-cell w-32">MODIFIED AT</div>
          <div className="table-cell w-30">PUBLISH DETAILS</div>
        </li>
        <div className="table-body">
          {renderEntries.length > 0 ? (
            <>
              <ul>
                {renderEntries?.map((entry) => {
                  const checked = selectedRefEntries.some(
                    (check) => check.uid === entry.uid
                  );
                  return (
                    <li
                      title={entry.title}
                      id={entry.uid}
                      key={entry.uid}
                      className={checked ? "active" : ""}
                      onClick={(event) => {
                        const liElement = event.currentTarget;
                        !checked && entry.uid === liElement.id
                          ? liElement.classList.add("active")
                          : liElement.classList.remove("active");
                        handleSelect(entry);
                        const checkbox =
                          liElement.childNodes[0].childNodes[0].childNodes[0];
                        checkbox.checked = !checkbox.checked;
                      }}
                    >
                      <div className="cs-checkbox w-5">
                        <label>
                          <input
                            type="checkbox"
                            className="cs"
                            defaultChecked={checked}
                            onChange={(event) => {
                              const style = event.target.parentNode.parentNode.parentNode;

                              !checked && entry.uid === style.id
                                ? style.classList.add("active")
                                : style.classList.remove("active");
                              handleSelect(entry);
                            }}
                          />
                          <span className="lbl"></span>
                        </label>
                      </div>
                      {isSelected ?
                        <div className="table-cell w-35">{entry.title}
                          <div className="content-type">Content type: <span>{entry._content_type_uid}</span></div>
                        </div>
                        :
                        <div className="table-cell w-35">{entry.title}</div>
                      }
                      <div className="table-cell w-35">
                        {moment(entry.updated_at).format(
                          "ddd, MMM D YYYY"
                        )}</div>
                      <div className="table-cell w-32">{
                        entry.publish_details.length > 0 ? entry.publish_details.map((env, index) => {
                          return (
                            <li key={index} className="env">{env}
                              <div>
                                <i className="icon-exclamation-sign status-publish"></i>
                              </div>
                            </li>
                          )
                        })
                          : <li className="env">Not Published</li>}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="load-more" id="loadMore" onClick={loadContent}
                style={{
                  display:
                    isSelected || skip[selectedRef] > totalEntries
                      ? "none"
                      : "block",
                }}
              >
                <a>Load More</a>
              </div>
            </>
          ) : (
            searchMsg && !isLoading ?
              <div className="no-item-found">No entries found</div>
              :
              <Loader />
          )}
        </div>
      </ul>
    );
  }
}
