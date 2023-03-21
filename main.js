var redrawGutter = () => {
  const url = window.location.href;
  
  var comments;
  if (url.includes("news.ycombinator.com")) {
    comments = $('tr.athing.comtr').map((_index, element) => ({
      absoluteTop: $(element).offset().top,
      top: $(element).offset().top / $(document).height(),
      height: $(element).height() / $(document).height(),
      depth: $(element).find('.ind').attr('indent'),
      text: $(element).find('.commtext.c00').text()
    })).get() 
  } else if (url.includes("github.com")) {
    comments = $('.comment').map((_index, element) => ({
      absoluteTop: $(element).offset().top - 59, // fit under thread sticky header
      top: $(element).offset().top / $(document).height(),
      height: $(element).height() / $(document).height(),
      depth: 0,
      text: $(element).find('.comment-body').text()
    })).get();
  } else { /*old.reddit.com*/
    comments = $('.entry').map((_index, element) => ({
      absoluteTop: $(element).offset().top,
      top: $(element).offset().top / $(document).height(),
      height: $(element).height() / $(document).height(),
      depth: Math.max($(element).parents().length - 5, 0) / 3, // 5, 8, 11... to 0, 1, 2...
      text: $(element).find('.md').text()
    })).get();
  }

  $(".comment-gutter-overlay").remove();
  comments.forEach(comment => {
    const hasLinks = comment.text.includes('https://') || comment.text.includes('http://');
    const isBig = comment.text.length > 1000; // including formatting
    const isColorMarked = isBig || hasLinks;
    const isTopLevel = comment.depth == 0;
    const isViewed = isColorMarked || isTopLevel;

    if (isViewed) {
      var div = document.createElement("div");
      div.className = "comment-gutter-overlay";
      div.style.position = "fixed";
      div.style.right = "0px";
      div.style.top = comment.top * 100 + '%';
      div.style.width = "8px";
      div.style.height = Math.min(comment.height * 100, 2) + '%'; // capped at 2% window height

      div.style.background = hasLinks ? "#08D" /*blue*/ : isBig ? "#3D0" /*green*/ : "#DDB" /*gray*/;

      switch (Math.round(comment.depth)) {
        case 0:
          div.style.opacity = isColorMarked ? 1.0 : 0.8;
          break;
        case 1:
          div.style.opacity = 1.0;
          break;
        case 2:
          div.style.opacity = 0.8;
          break;
        case 3:
          div.style.opacity = 0.6;
          break;
        default:
          div.style.opacity = 0.5;
      };

      $(div).hover(() => {
        $(div).css('cursor', 'pointer');
      });
      $(div).click(() => {
        $('html, body').animate({
          scrollTop: comment.absoluteTop
        }, 200 /*millis*/);
      });
      document.body.appendChild(div);
    }
  });
};

$(document).on('pjax:end', () => {
  redrawGutter();
});

var documentHeight = $(document).height();
$(window).bind('DOMSubtreeModified', () => {
  setTimeout(() => {
    if ($(document).height() != documentHeight) {
      documentHeight = $(document).height();
      redrawGutter();
    }
  }, 10 /*millis*/)
});

if (window.location.href.includes("github.com")) {
  setTimeout(() => {
    redrawGutter();
  }, 500 /*millis*/)
}

$(window).resize(() => {
  redrawGutter();
});

redrawGutter();
