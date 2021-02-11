// parent window js file
let extensionField;
const row = $('#entry-list');
let uid;
let selectedData = [];
let allEnv;
let baseUrl;

// fetch all home/house entries
async function getHomeEntries(id) {
  return new Promise((resolve, reject) => {
    axios({
      url: `${extensionField.config.baseURL}v3/content_types/${extensionField.config.contentType}/entries?locale=en-us&include_publish_details=true`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        api_key: `${extensionField.config.apiKey}`,
        authorization: `${extensionField.config.managementToken}`
      }
    })
      .then((result) => {
        resolve(result.data);
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

// click event handler to remove entry
function onClick(e) {
  let eventId = $(e).find();
  let deleteEntries;
  if (selectedData.length !== 0) {
    selectedData.map((obj) => {
      if (obj.entry_uid === eventId.context.id) {
        deleteEntries = selectedData.indexOf(obj);
      }
    });
    selectedData.splice(deleteEntries, 1);
    $(`#${eventId.context.id}`).parent().parent().parent()
      .remove();
    extensionField.field.setData(selectedData);
  }
}
// window pop-up event
$('#choose-button').on('click', function () {
  const ref = window.open(extensionField.config.windowURL, 'pop', 'width=900,left=500,height=500,menubar=no,toolbar=no,status=no');
});

// render entries
function renderHandler(data) {
  if (data.length <= 0) {
    $('#message-id').show();
  }
  if (data.length !== 0) {
    $('#message-id').hide();
    if (Object.keys(data).length !== 0) {
      data.map((index) => {
        let categoryList = `<div class="col-xs-6 col-sm-4 col-md-3 mainDiv">
                                    <li>
                                      <div>${index.title}
                                      </div>
                                          <div class="refer-ct-name">Content type:home </div>
                                        <div> 
                                          <span class="action" id='${index.entry_uid}' onclick="onClick(${index.entry_uid})">
                                            <img src="https://app.contentstack.com/static/images/remove-entry.svg">
                                          </span>
                                        </div>
                                    </li>
                                  </div>`;
        row.append(categoryList);
      });
    }
  }
}

// handler to send data to child/pop-up window
function handler() {
  return new Promise(async (resolve, reject) => {
    let windowData = [];
    let homeEntries = await getHomeEntries();
    let envList = allEnv;
    let homeFilter = homeEntries.entries.filter((i) => i.person[0].uid === uid);
    homeFilter.map((index) => {
      let nameEnv = [];
      index.publish_details.map((newIndex) => {
        envList.environments.filter((item) => {
          if (item.uid === newIndex.environment) nameEnv.push(item.name);
        });
        return nameEnv;
      });
      let newObject = {
        entry_uid: index.uid,
        title: index.title,
        updated_by: index.updated_by,
        publish_detail: nameEnv,
        checkedValue: false
      };
      windowData.push(newObject);
      resolve(windowData);
    });
  });
}

// message eventListener handler
async function windowEventHandler(event) {
  if (event.data.hasOwnProperty('response')) {
    if (event.data.response.message === 'selectedEntries') {
      event.data.response.result.map((i) => selectedData.push(i));
      if (selectedData.length !== 0) {
        $('.mainDiv').remove();
        renderHandler(selectedData);
      }
      if (selectedData.length <= 0) {
        $('.mainDiv').remove();
      }
      extensionField.field.setData(selectedData);
    } else if (event.data.response.message === 'initialData') {
      let response = await handler();
      let newURL = new URL(extensionField.config.windowURL);
      baseUrl = newURL.protocol + '//' + newURL.hostname;
      event.source.postMessage(
        {
          response: {
            entryResponse: response,
            current: selectedData || []
          }
        },
        baseUrl
      );
    }
  }
}

// Contentstack UI initialize
$(document).ready(() => {
  ContentstackUIExtension.init().then((extension) => {
    extensionField = extension;
    extensionField.window.enableAutoResizing();
    selectedData = extensionField.field.getData();
    renderHandler(selectedData);
    extensionField.stack.getEnvironments('get').then((result) => {
      allEnv = result;
    });
    extension.entry.onChange(async (event) => {
      if (event.person.length > 0) {
        uid = event.person[0].uid;
      } else {
        let empty = [];
        selectedData = empty;
        $('.mainDiv').remove();
        extensionField.field.setData(selectedData);
      }
    });
  });
});
window.addEventListener('message', windowEventHandler);
