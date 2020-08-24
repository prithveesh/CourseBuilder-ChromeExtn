
!function () {
  const origin = window.location.origin;

  function _CE_GetAttendance({ emp, startDate, endDate, employees = {} }) {
    const now = new Date();
    if (!startDate) {
      startDate = `01/${now.getMonth()}/${now.getFullYear()}`;
    }
    if (!endDate) {
      endDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    }
    const reqParam = { 'FROM_DATE': startDate, 'TO_DATE': endDate };

    let url = `${origin}/SavvyHRMS/SelfService/AttendanceCalendarmmt.aspx`;
    if (emp) {
      reqParam['EMPLOYEE_ID'] = `${emp}`;
      url = `${origin}/SavvyHRMS/SelfService/ShowMyTeamCalendar.aspx`;
    }

    try {
      return fetch(`${url}/GetEmployeeRegister`, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
          'Connection': 'keep-alive',
          'Content-Type': 'application/json; charset=UTF-8',
          'Pragma': 'no-cache',
          'Origin': 'http//172.16.172.49',
          'Accept-Encoding': 'gzip, deflate',
          'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Cache-Control': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest',
        },
        referrer: url,
        body: JSON.stringify(reqParam)
      }).then(response => response.json())
        .then(str => (new window.DOMParser()).parseFromString(str.d, "text/xml"))
        .then(data => {
          return {
            data: data
          };
        })
        .then(resp => {
          return {
            ...resp,
            Name: resp.data.querySelector('EMPLOYEE_NAME').innerHTML,
          }
        })
        .then(resp => {
          return {
            ...resp,
            Code: resp.data.querySelector('EMPLOYEE_CODE').innerHTML,
          }
        })
        .then(resp => {
          return {
            ...resp,
            'Start Date': startDate,
            'End Date': endDate
          }
        })
        .then(resp => {
          return {
            ...resp,
            ['Hours']: Array.prototype.slice.call(resp.data.querySelectorAll('TOTAL_HOURS')).reduce((acc, elem) => {
              if (elem.innerHTML) {
                const times = elem.innerHTML.split(':');
                const hr = +times[0];
                const min = +times[1];

                if (hr > 0) {
                  acc += hr * 60 + min;
                }
              }

              return acc;
            }, 0)
          }
        })
        .then(resp => {
          return {
            ...resp,
            ['Working Days']: Array.prototype.slice.call(resp.data.querySelectorAll('EAR_ATTENDANCE_STATUS')).reduce((acc, elem) => {
              if (elem.innerHTML.trim() === 'P') return ++acc;
              return acc;
            }, 0)
          }
        })
        .then(resp => {
          return {
            ...resp,
            ['Average']: `${parseInt(resp['Hours'] / 60 / resp['Working Days'])} hours ${parseInt((resp['Hours'] / resp['Working Days']) % 60)} minutes`,
            ['Hours']: parseInt(resp['Hours'] / 60)

          }
        })
        .then(resp => {
          return {
            ...resp,
            ['Work From Home']: Array.prototype.slice.call(resp.data.querySelectorAll('EAR_ATTENDANCE_STATUS')).reduce((acc, elem) => {
              if (elem.innerHTML.trim() === 'WFH') return ++acc;
              return acc;
            }, 0)
          }
        })
        .then(resp => {
          return {
            ...resp,
            Leaves: Array.prototype.slice.call(resp.data.querySelectorAll('EAR_ATTENDANCE_STATUS')).reduce((acc, elem) => {
              if (elem.innerHTML.trim() === 'EL') return ++acc;
              return acc;
            }, 0)
          }
        })
        .then(resp => {
          delete resp.data;
          employees[resp.Name] = {
            ...resp
          }
          return employees;
        })
        .then(resp => {
          console.log(resp);
          return resp;
        });
    }
    catch (ex) {
      console.log(ex);
      Promise.resolve();
    }
  }

  function _CE_GetTeam() {
    const url = `${origin}/SavvyHRMS/SelfService/ShowMyTeamCalendar.aspx`;

    return fetch(`${url}/GetMyTeam?_=${(new Date()).getTime()}`, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Accept': 'application/xml, text/xml, */*; q=0.01',
        'Content-Type': 'application/json; charset=utf-8',
        'X-Requested-With': 'XMLHttpRequest',
      },
      referrer: url
    })
      .then(response => response.text())
      .then(resp => (new window.DOMParser()).parseFromString(resp, "text/xml"))
      .then(resp => Array.prototype.slice.call(resp.querySelectorAll('EMPLOYEE_ID')).map(elem => +elem.innerHTML))
  }

  function _CE_SaveFile(filename, text) {
    var tempElem = document.createElement('a');
    tempElem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    tempElem.setAttribute('download', filename);
    tempElem.click();
  }

  function _CE_AlertHours(employees) {
    let str = '';
    for (let employee of Object.values(employees)) {
      str += `${employee.Name}:  ${employee.Average}\n`;
    }
    alert(str);
    return employees;
  }

  function _CE_ConvertToCSV(employees) {
    let str = '';
    for (let key of Object.keys(Object.values(employees)[0])) {
      str += (`${key};`);
    }
    str += '\n';
    for (let employee of Object.values(employees)) {
      for (let value of Object.values(employee)) {
        str += (`${value};`);
      }
      str += '\n';
    }
    _CE_SaveFile(`my-${(new Date()).getTime()}.csv`, str);
    console.log(str);
    return employees;
  }

  window._CE_SaveFile = _CE_SaveFile;
  window._CE_ConvertToCSV = _CE_ConvertToCSV;
  window._CE_AlertHours = _CE_AlertHours;
  window._CE_GetTeam = _CE_GetTeam;
  window._CE_GetAttendance = _CE_GetAttendance;
}();