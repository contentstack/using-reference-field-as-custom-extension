// pop-up window js file

let checkedArray = [];
window.onload = () => {
  // checkbox selection handler
  function selectionHandler(event) {
    event.data.response.entryResponse.map((index) => {
      let checkVal;
      if (event.data.response.hasOwnProperty('current')) {
        checkVal = event.data.response.current.find((i) => i.entry_uid === index.entry_uid);
        checkedArray.push(checkVal);
        if (checkVal === undefined && event.data.response.current.length <= 0) {
        } else if (checkVal !== undefined && event.data.response.current.length !== 0) {
          if (event.data.response.current.length === event.data.response.entryResponse.length) {
            $('.selectAll').prop('checked', true);
          } else if (event.data.response.current.length !== event.data.response.entryResponse.length) {
            $('.selectAll').prop('checked', false);
          }
        }
      }

      let string = index.publish_detail.length !== 0 ? index.publish_detail.join(',') : 'Not Published';
      $('.cs-table-body').show();
      $('.cs-table-body').append(`<li id=${index.entry_uid} class="table-row">
                                            <div class="table-cell w-10">
                                              <input type="checkbox" ${checkVal ? 'checked' : null} class="check"/>
                                            </div>
                                              <div class="table-cell w-20">${index.title}</div>
                                              <div class="table-cell w-20">${index.updated_by}</div>
                                              <div class="table-cell w-40"><span>${string}</span></div>
                                          </li>
                                    `);
    });
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
    checkedArray = values;
    window.opener.postMessage(
      {
        response: {
          message: 'selectedEntries',
          result: checkedArray
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
