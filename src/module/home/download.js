!function () {
  const course = {
    title: document.querySelector('h1.clp-lead__title').innerText,
    description: document.querySelector('div.clp-lead__headline').innerText,
    learning: Array.prototype.slice.call(document.querySelectorAll('.what-you-get__text')).map(elem => elem.innerText),
    lectures: parseInt(document.querySelector('.ud-component--clp--curriculum>div.curriculum-header-container').querySelector('.dib').innerText),
    duration: document.querySelector('.ud-component--clp--curriculum>div.curriculum-header-container').querySelector('.curriculum-header-length').innerText,
  }

  document.querySelector('[data-purpose=load-full-curriculum]') && document.querySelector('[data-purpose=load-full-curriculum]').click();

  setTimeout(() => {
    const courseList = Array.prototype.slice.call(document.querySelectorAll('.ud-component--clp--curriculum>div:not(.curriculum-header-container)'));
    course.sections = getSectionsDetails(courseList);
    console.log(course);
    convertIntoCSV(course);
  });
}();

function getSectionsDetails(courseList) {
  const sections = [];
  courseList.forEach(section => {
    const chapter = {};
    chapter.title = section.querySelector('a .section-header-left .section-title-text').innerText;
    chapter.duration = section.querySelector('a .section-header-right .section-header-length').innerText;
    chapter.videos = [];

    const videos = Array.prototype.slice.call(section.querySelectorAll('.lecture-container'));

    videos.map(elem => {
      chapter.videos.push({
        name: elem.querySelector('.left-content .title') && elem.querySelector('.left-content .title').innerText,
        description: elem.querySelector('.left-content .description') && elem.querySelector('.left-content .description').innerText,
        duration: elem.querySelector('.details .content-summary').innerText,
      });
    })

    sections.push(chapter);
  });
  return sections;
}

function convertIntoCSV(course) {
  let data = ';\n';
  /*     
  `${}\n`
  */
  data += `${course.title}\n`;
  data += `${course.description}\n\n`;
  data += course.learning.reduce((acc, elem) => {
    acc += `;${elem}\n`;
    return acc;
  }, 'Learnings') + '\n\n';

  data += `Course Content;${course.lectures} Lectures;${course.duration}\n`;
  data += course.sections.reduce((acc, section) => {
    acc += `${section.title.toUpperCase()};;${section.duration}\n`;
    acc += section.videos.reduce((sectionAcc, video) => {
      sectionAcc += `;${video.name};${video.duration};${video.description || ''}\n`;
      return sectionAcc;
    }, '') + '\n';
    return acc;
  }, '');

  _CE_SaveFile(`${course.title}.csv`, data);
}

function _CE_SaveFile(filename, text) {
  var tempElem = document.createElement('a');
  tempElem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  tempElem.setAttribute('download', filename);
  tempElem.click();
}