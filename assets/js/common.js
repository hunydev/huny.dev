fetch("/.netlify/functions/access").then((response) => {
    if(response.status == 429){
        document.body.innerHTML = `<h1>Too many requests</h1>`;

        return;
    }
});

(function() {
    
})();

/*
Layout
*/
let menu = `
<div class="ui menu right overlay inverted vertical thin sidebar">
  <a href="javascript:void(0);" class="item sidebar close">Close<i style="margin-left: 2px;" class="floating close icon"></i></a>
  <div class="item">
    <div class="header">Draft</div>
    <div class="menu">
      <a class="item" href="/draft/blog">Blog</a>
      <a class="item" href="/draft/tool">Tool</a>
    </div>
  </div>
  <div class="item">
    <a class="header" href="/tools">Tools</a>
    <div class="menu">
      <a class="item" href="#">A</a>
      <a class="item" href="#">B</a>
    </div>
  </div>
  <a href="https://blog.huny.dev" target="_blank" class="item">Blog<i style="margin-left: 2px;" class="floating small external alternate icon"></i></a>
  <a href="/chat" target="_blank" class="item">Chat<i style="margin-left: 2px;" class="floating small external alternate icon"></i></a>
</div>
<div class="ui fixed inverted menu">
  <div class="ui container">
    <a href="/" class="header item">
      <img class="logo" src="/assets/images/logo.png">
      HunyDev
    </a>
    <div class="ui simple dropdown item">
      Draft <i class="dropdown icon"></i>
      <div class="menu">
        <a class="item" href="/draft/blog">Blog</a>
        <a class="item" href="/draft/tool">Tool</a>
      </div>
    </div>
    <div class="ui simple dropdown item">
      Tools <i class="dropdown icon"></i>
      <div class="menu">
        <a class="item">Coming soon</a>
        <!--
        <a class="item" href="#">Link Item</a>
        <a class="item" href="#">Link Item</a>
        <div class="divider"></div>
        <div class="header">Header Item</div>
        <div class="item">
          <i class="dropdown icon"></i>
          Sub Menu
          <div class="menu">
            <a class="item" href="#">Link Item</a>
            <a class="item" href="#">Link Item</a>
          </div>
        </div>
        <a class="item" href="#">Link Item</a>
        -->
      </div>
    </div>
    <a href="https://blog.huny.dev" target="_blank" class="right item">Blog<i style="margin-left: 2px;" class="floating small external alternate icon"></i></a>
    <a href="/chat" target="_blank" class="right item" style="margin-left: 0 !important">Chat<i style="margin-left: 2px;" class="floating small external alternate icon"></i></a>
    <a class="right item sidebar open">
      <i class="sidebar icon"></i>
    </a>
  </div>
</div>`;

let modal = `
<div class="ui modal credits">
  <div class="header">Credits</div>
  <div class="content scrolling">
    <p>This website uses several third-party tools and libraries to enhance its functionality and user experience. Below is the list of these tools with their respective copyrights and licenses.</p>
    <p></p>
    <p>1. jQuery</p>
    <p>jQuery is a fast, small, and feature-rich JavaScript library. It makes things like HTML document traversal and manipulation, event handling, and animation much simpler with an easy-to-use API that works across a multitude of browsers.</p>
    <p>- Copyright: The jQuery Foundation</p>
    <p>- License: MIT License</p>
    <p>- Website: https://jquery.com/</p>
    <p></p>
    <p>2. Semantic UI</p>
    <p>Semantic UI is a modern front-end development framework, powered by LESS and jQuery, that helps create beautiful, responsive layouts using human-friendly HTML.</p>
    <p>- Copyright: Semantic UI</p>
    <p>- License: MIT License</p>
    <p>- Website: https://semantic-ui.com/</p>
    <p></p>
    <p>3. jQuery Table Sort Plugin</p>
    <p>The jQuery Table Sort Plugin allows for the sorting of tables based on column headers. It is a lightweight solution that enhances the functionality of HTML tables.</p>
    <p>- Copyright: Kyle Fox</p>
    <p>- License: MIT License</p>
    <p>- Website: https://github.com/kylefox/jquery-tablesort</p>
    <p></p>
    <p>All mentioned tools and libraries are used under their respective licenses which allow for commercial and non-commercial use, provided that proper credit is given as outlined above.</p>
  </div>
  <div class="actions">
    <div class="ui cancel button">Close</div>
  </div>
</div>
<div class="ui modal terms_and_conditions">
  <div class="header">Terms and Conditions</div>
  <div class="content scrolling">
    <p>1. Introduction</p>
    <p>These terms and conditions govern the use of the website HunyDev. By using this website, you agree to these terms in full.</p>
    <p></p>
    <p>2. Copyright</p>
    <p>All content on this website is protected by copyright laws. Users are authorized to use the content only for educational and informational purposes.</p>
    <p></p>
    <p>3. Restrictions</p>
    <p>Users must not use the website for any unlawful purposes. Actions that cause, or may cause, damage to the website or impairment of the performance, availability, or accessibility of the website are prohibited.</p>
    <p></p>
    <p>4. Disclaimer</p>
    <p>The information on this website is provided "as is" without any representations or warranties, express or implied. We do not warrant that the information on this website is complete, true, accurate, or non-misleading.</p>
    <p></p>
    <p>5. Amendments</p>
    <p>The website owner reserves the right to revise these terms and conditions at any time. The revised terms and conditions shall apply from the date of their publication on the website.</p>
    <p></p>
    <p>HunyDev © 2024</p>
  </div>
  <div class="actions">
    <div class="ui cancel button">Close</div>
  </div>
</div>
<div class="ui modal privacy_policy">
  <div class="header">Privacy Policy</div>
  <div class="content scrolling">
    <p>1. Personal Information Collection</p>
    <p>This website, HunyDev, utilizes Google AdSense to serve ads, which may involve the collection of certain user information, managed according to Google's privacy policy.</p>
    <p></p>
    <p>2. Use of Information</p>
    <p>The information collected may be used to enhance user experience, provide personalized advertising, and for statistical analysis purposes.</p>
    <p></p>
    <p>3. Data Security</p>
    <p>We take reasonable security measures to protect user information. However, transmission of information over the internet is not completely secure, and we cannot guarantee absolute security.</p>
    <p></p>
    <p>4. Use of Cookies</p>
    <p>HunyDev may use cookies to improve user experience. Users can manage cookies through their web browser settings.</p>
    <p></p>
    <p>5. Privacy Policy Changes</p>
    <p>This privacy policy is subject to change and may be updated periodically. Any changes will be posted on the website.</p>
    <p></p>
    <p>HunyDev © 2024</p>
  </div>
  <div class="actions">
    <div class="ui cancel button">Close</div>
  </div>
</div>`;

let footer = `
<div class="ui center aligned container">
  <div class="ui stackable inverted divided grid">
    <div class="three wide column">
      <h4 class="ui inverted header">HunyDev</h4>
      <div class="ui inverted link list">
        <a href="/" class="item">Home</a>
        <a href="https://blog.huny.dev" target="_blank" class="item">Blog</a>
        <a href="https://huny.notion.site" target="_blank" class="item">Notion</a>
      </div>
    </div>
    <div class="three wide column">
      <h4 class="ui inverted header">Draft</h4>
      <div class="ui inverted link list">
        <a href="/draft/blog" class="item">Blog</a>
        <a href="/tool" class="item">Tool</a>
      </div>
    </div>
    <div class="three wide column">
      <h4 class="ui inverted header">Tools</h4>
      <div class="ui inverted link list">
        <a href="#" class="item">String</a>
        <a href="#" class="item">Audio</a>
        <a href="#" class="item">Automatic</a>
        <a href="#" class="item">Network</a>
      </div>
    </div>
    <div class="seven wide column">
      <h4 class="ui inverted header">About</h4>
      <p>This website is a space for personal development projects.</p>
      <p>If you have any questions, please feel free to email me at any time.</p>
    </div>
  </div>
  <div class="ui inverted section divider"></div>
  <img src="/assets/images/logo.png" class="ui centered mini image">
  <div class="ui horizontal inverted small divided link list">
    <a class="item" href="mailto:jang@huny.dev">Contact Us</a>
    <a class="item credits">Credits</a>
    <a class="item terms_and_conditions">Terms and Conditions</a>
    <a class="item privacy_policy">Privacy Policy</a>
  </div>
</div>`;

function mainonly(){
  const params = new URLSearchParams(window.location.search);
  return params.has('mainonly');
}

$(document).ready(function(){
  if(mainonly()){
    console.log("mainonly");
    return;
  }
  let $menu = $(menu);
  let $modal = $(modal);
  let $footer = $(footer);
  $("body").prepend($menu);
  $("body").append($modal);
  $("div.footer.segment").html($footer);

  $(".ui.modal.credits").modal('attach events', 'a.item.credits');
  $(".ui.modal.terms_and_conditions").modal('attach events', 'a.item.terms_and_conditions');
  $(".ui.modal.privacy_policy").modal('attach events', 'a.item.privacy_policy');

  $("div.sidebar").sidebar({
    transition: 'overlay', 
  }).sidebar('attach events', 'a.item.sidebar');
});