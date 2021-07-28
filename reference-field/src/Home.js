/* eslint-disable react/jsx-no-target-blank */
import React from "react";
import Dragula from "react-dragula";
import { WindowOpener } from "./components/windowOpener";
import ContentstackUIExtension from "@contentstack/ui-extensions-sdk";
import "./styles/style.css";


export class Home extends React.Component {
  constructor(props) {
    super(props);
    this.extension = {};
    this.state = {
      message: "",
      entryList: [],
      config: {},
      referenceTo: [],
      envList: [],
      initialLoader: true
    };
    this.sonResponse = this.sonResponse.bind(this);
    this.isEmpty = this.isEmpty.bind(this);
  }

  getProcessedEntry(ctUid, uid, entry) {
    return new Promise((resolve) => {
      this.extension.stack.ContentType(ctUid).Entry(uid)
        .addParam('include_publish_details', 'true')
        .fetch()
        .then(async result => {
          let newResult = Object.assign({}, result.entry, entry)
          let nameEnv = [];
          newResult.publish_details.map((newEntry) => {
            this.state.envList.length > 0 ?
              this.state.envList.environments.filter((env) => {
                if (env.uid === newEntry.environment) nameEnv.push(env.name);
              }) : '';
            return nameEnv;
          });

          newResult['publish_details'] = nameEnv;
          resolve(newResult);
        }).catch(err => {
          console.log(err);
        })
    })
  }

  componentDidMount() {
    ContentstackUIExtension.init().then(async (extension) => {
      let initialEntries = extension.field.getData();
      this.extension = extension;
      extension.window.enableAutoResizing();

      extension.stack.getEnvironments('get').then((result) => {
        this.setState({
          envList: result,
          apiKey: extension.stack.getData().api_key
        })
      });

      if (initialEntries !== null && initialEntries !== undefined && !this.isEmpty(initialEntries)) {
        let processedEntries = [];

        await Promise.all(initialEntries.map(async (entry) => {
          let newResult = await this.getProcessedEntry(entry._content_type_uid, entry.uid, entry);
          processedEntries.push(newResult);
        }));

        this.setState({
          config: extension.config,
          referenceTo: extension.field.schema.reference_to,
          entryList: processedEntries,
          initialLoader: false
        }, () => {
          extension.window.enableAutoResizing();
          window.addEventListener("message", receiveMessage, false);
        });
      } else {
        this.setState({
          config: extension.config,
          referenceTo: extension.field.schema.reference_to,
          initialLoader: false
        }, () => {
          extension.window.enableAutoResizing();
          window.addEventListener("message", receiveMessage, false);
        });
      }
    });

    const receiveMessage = (event) => {
      const { data } = event;
      const { config, entryList, referenceTo, envList } = this.state;
      let query = config.query && JSON.parse((config.query).replace(/\'/g, '\"'))

      if (data.getConfig) {
        event.source.postMessage(
          {
            message: "Sending Config files",
            config,
            referenceTo: referenceTo,
            selectedRefEntries: entryList,
          },
          event.origin
        );
      } else if (data.selectedRefEntries) {
        this.saveExtensionData(data.selectedRefEntries);
      }
      else if (data.message === 'add') {
        this.getEntries(data.selectedRef, data.skip).then((result) => {
          event.source.postMessage({
            message: "Sending entries",
            entries: result
          }, event.origin);
        });
      } else if (data.message === 'loadmore') {
        this.getEntries(data.selectedRef, data.skip).then((result) => {
          event.source.postMessage({
            message: "loadmoreResult",
            loadmoreResult: result
          }, event.origin);
        });
      } else if (data.message === 'search') {
        if (config.query) {
          this.extension.stack.ContentType(data.selectedRef).Entry
            .Query()
            .query(query)
            .addParam('include_publish_details', 'true')
            .addParam('include_count', 'true')
            .limit(10)
            .regex('title', '^' + data.query, 'i')
            .find()
            .then(result => {
              result.entries.map((entry) => {
                let nameEnv = [];
                entry.publish_details.map((newEntry) => {
                  envList.environments.filter((env) => {
                    if (env.uid === newEntry.environment) nameEnv.push(env.name);
                  });
                  return nameEnv;
                });
                entry['publish_details'] = nameEnv;
                entry['_content_type_uid'] = data.selectedRef;
              });

              event.source.postMessage({
                message: "searchResult",
                searchResult: result
              }, event.origin)
            })
        } else {
          this.extension.stack.ContentType(data.selectedRef).Entry
            .Query()
            .addParam('include_publish_details', 'true')
            .addParam('include_count', 'true')
            .limit(10)
            .regex('title', '^' + data.query, 'i')
            .find()
            .then(result => {
              result.entries.map((entry) => {
                let nameEnv = [];
                entry.publish_details.map((newEntry) => {
                  envList.environments.filter((env) => {
                    if (env.uid === newEntry.environment) nameEnv.push(env.name);
                  });
                  return nameEnv;
                });
                entry['publish_details'] = nameEnv;
                entry['_content_type_uid'] = data.selectedRef;
              });

              event.source.postMessage({
                message: "searchResult",
                searchResult: result
              }, event.origin)
            })
        }
      }
    };
  }

  getEntries(contentTypeUid, skip) {
    let { config, envList } = this.state;
    let query = config.query && JSON.parse((config.query).replace(/\'/g, '\"'));

    if (config.query) {
      return new Promise(async (resolve, reject) => {
        this.extension.stack.ContentType(contentTypeUid).Entry
          .Query()
          .query(query)
          .addParam('include_publish_details', 'true')
          .addParam('include_count', 'true')
          .limit(10)
          .skip(skip[contentTypeUid])
          .find()
          .then(result => {
            result.entries.map((entry) => {
              let nameEnv = [];
              entry.publish_details.map((newEntry) => {
                envList.environments.filter((env) => {
                  if (env.uid === newEntry.environment) nameEnv.push(env.name);
                });
                return nameEnv;
              });
              entry['publish_details'] = nameEnv;
              entry['_content_type_uid'] = contentTypeUid;
            })
            resolve(result);
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      })
    } else {
      return new Promise(async (resolve, reject) => {
        this.extension.stack.ContentType(contentTypeUid).Entry
          .Query()
          .addParam('include_publish_details', 'true')
          .addParam('include_count', 'true')
          .limit(10)
          .skip(skip[contentTypeUid])
          .find()
          .then(result => {
            result.entries.map((entry) => {
              let nameEnv = [];
              entry.publish_details.map((newEntry) => {
                envList.environments.filter((env) => {
                  if (env.uid === newEntry.environment) nameEnv.push(env.name);
                });
                return nameEnv;
              });
              entry['publish_details'] = nameEnv;
              entry['_content_type_uid'] = contentTypeUid;
            })
            resolve(result);
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      })
    }
  }

  saveExtensionData(entries) {
    let extensionData = [];

    entries.forEach(selected => {
      extensionData.push({
        uid: selected.uid,
        _content_type_uid: selected._content_type_uid
      });
    });

    this.extension.field.setData(extensionData);
    this.setState({ entryList: entries });
  }

  handleFocus = () => {
    this.extension.field.setFocus();
  }

  removeEntry = (e) => {
    let id = e.currentTarget.dataset.id;
    let { entryList } = this.state;

    entryList.splice(
      entryList.findIndex((index) => index.uid === id),
      1
    );

    this.saveExtensionData(entryList);
  }

  sonResponse(err, res) {
    if (err) {
      this.setState({ message: res.message });
    }
  }

  dragulaDecorator = (componentBackingInstance) => {
    if (componentBackingInstance) {
      let options = {
        copySortSource: true,
      };
      Dragula([componentBackingInstance], options);
    }
  };

  isEmpty(obj) {
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
    }
    return true;
  }

  render() {
    const { entryList, config, apiKey, initialLoader } = this.state;
    let host = (window.location != window.parent.location)
      ? document.referrer
      : document.location.href;

    return (
      <header className="App-header">
        {initialLoader ? (
          <div className="reference-loading">
            <div className="loading-flash">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        ) : (
          <div className="wrapper" id="wrapper" onClick={this.handleFocus}>
            <div className="container">
              {entryList.length > 0 ?
                <div className="selected-reference-count">
                  {entryList.length} entry referenced
	            </div> : ''}
              <div className="main">
                <div className="selected-item">
                  <div className="row selected-list">
                    <ul className="drag1" ref={this.dragulaDecorator}>
                      {entryList?.map((entry, index) => {
                        return (
                          <li id={entry.uid} key={index}>
                            <div className="file">
                              <div className="entry-ref">
                                <div>{entry.title}</div>
                                <div className="content-type">Content type: <span>{entry._content_type_uid}</span></div>
                              </div>
                              <div className="ref-action">
                                <span className="edit-entry">
                                  <a href={`${host}#!/stack/${apiKey}/content-type/${entry._content_type_uid}/en-us/entry/${entry.uid}/edit`} target="_blank">
                                    <img src="https://app.contentstack.com/static/images/edit-icon-ref1.svg" />
                                  </a>
                                </span>
                                <span className="file-action trash" data-id={entry.uid} onClick={this.removeEntry.bind(this)}>
                                  <img src="https://app.contentstack.com/static/images/remove-entry.svg" />
                                </span>
                              </div>

                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <WindowOpener
              url={config.redirectUrl}
              bridge={this.sonResponse}
              refEntries={entryList}
            >
              Choose Entry
            </WindowOpener>
          </div>
        )}
      </header>
    );
  }
}
