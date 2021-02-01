// pop-up window js file

window.onload = () => {
  // selection handler
  function selectionHandler(event) {
    if (event.data.response.current.length <= 0) {
      event.data.response.entryResponse.map((index) => {
        let string = index.publish_detail.length !== 0 ? index.publish_detail.join(',') : 'Not Published';
        $('.cs-table-body').show();
        $('.cs-table-body').append(`<li id=${index.entry_uid} class="table-row">
                                              <div class="table-cell w-10">
                                                <input type="checkbox" class="check"/>
                                              </div>
                                                <div class="table-cell w-20">${index.title}</div>
                                                <div class="table-cell w-20">${index.updated_by}</div>
                                                <div class="table-cell w-40"><span>${string}</span></div>
                                            </li>
                                      `);
      });
    }
    if (event.data.response.current.length !== 0) {
      let updatedArray = [];
      for (let i = 0, lengthOne = event.data.response.current.length; i < lengthOne; i++) {
        for (let j = 0, lengthTwo = event.data.response.entryResponse.length; j < lengthTwo; j++) {
          if (event.data.response.current[i].entry_uid === event.data.response.entryResponse[j].entry_uid) {
            event.data.response.entryResponse.splice(j, 1);
            lengthTwo = event.data.response.entryResponse;
            updatedArray = lengthTwo;
          }
        }
      }
      if (updatedArray.length !== 0) {
        updatedArray.map((index) => {
          let string = index.publish_detail.length !== 0 ? index.publish_detail.join(',') : 'Not Published';
          $('.cs-table-body').show();
          $('.cs-table-body').append(`<li id=${index.entry_uid} class="table-row">
                                              <div class="table-cell w-10">
                                                <input type="checkbox" class="check"/>
                                              </div>
                                                <div class="table-cell w-20">${index.title}</div>
                                                <div class="table-cell w-20">${index.updated_by}</div>
                                                <div class="table-cell w-40"><span>${string}</span></div>
                                            </li>
                                      `);
        });
      }
    }
  }

  $('body').on('click', '.selectAll', function () {
    $('input:checkbox').not(this).prop('checked', this.checked);
  });

  $('#choose').on('click change', () => {
    let values = new Array();
    $.each($('.check:checked'), function (event) {
      var data = $(this).parents('li');
      values.push({
        entry_uid: data[0].id,
        title: $(data).find('div:eq(1)').text(),
        updated_by: $(data).find('div:eq(2)').text(),
        publish_detail: $(data).find('div:eq(3)').text(),
        checkedValue: data.context.checked
      });
    });
    window.opener.postMessage(
      {
        response: {
          message: 'selectedEntries',
          result: values
        }
      },
      '*'
    );
    window.close();
  });
  window.addEventListener('message', selectionHandler);

  $(document).ready(() => {
    window.opener.postMessage(
      {
        response: {
          message: 'initialData'
        }
      },
      '*'
    );
  });
};
