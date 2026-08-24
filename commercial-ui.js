/* =========================================================
   ACCOUNTING TYCOON — COMMERCIAL UI v3
   Safe DOM enhancement only. Does not replace backend functions.
   ========================================================= */
(function(){
  "use strict";

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

  function setText(el, text){
    if(el && el.textContent !== text) el.textContent = text;
  }

  function upgradeBrand(){
    const mark = $(".logoMark");
    if(mark) mark.textContent = "";

    const tagline = $(".tagline");
    setText(tagline, "BUSINESS SIMULATION • ACCOUNTING PRACTICE • LEARNING ANALYTICS");
  }

  function upgradeLanding(){
    const hero = $("#landingView .hero");
    if(hero){
      hero.innerHTML = `
        <div class="eyebrow">Interactive accounting simulation</div>
        <h1>Learn accounting by <b>running the business.</b></h1>
        <p>Accounting Tycoon turns journal-entry practice into a multiplayer business simulation. Students make commercial decisions, record the accounting consequences and receive immediate feedback while educators see learning unfold in real time.</p>

        <div class="commercial-proof">
          <div><b>Multiplayer</b><span>Simultaneous team play</span></div>
          <div><b>Immediate</b><span>Accounting feedback</span></div>
          <div><b>Diagnostic</b><span>Live learning analytics</span></div>
        </div>

        <div class="featureGrid">
          <div class="feature" data-num="01"><strong>Run the business</strong><span>Teams navigate realistic purchasing, financing, sales and operating decisions.</span></div>
          <div class="feature" data-num="02"><strong>Record the accounting</strong><span>Each business event becomes an accounting entry with automated checking and feedback.</span></div>
          <div class="feature" data-num="03"><strong>Learn through feedback</strong><span>Students retry misconceptions while the correct accounting is preserved in the simulation.</span></div>
          <div class="feature" data-num="04"><strong>See what students understand</strong><span>Teachers monitor first-attempt accuracy, topic mastery, hints, response time and error patterns.</span></div>
        </div>
      `;
    }

    const entry = $("#landingView .entryPanel");
    const cards = $$("#landingView .roleCard");
    if(entry && cards.length >= 2 && !$(".access-switch", entry)){
      const switcher = document.createElement("div");
      switcher.className = "access-switch";
      switcher.innerHTML = `
        <button type="button" data-access="student" class="active">Join a Game</button>
        <button type="button" data-access="teacher">Teacher Sign In</button>
      `;
      entry.prepend(switcher);

      const teacher = cards[0];
      const student = cards[1];
      teacher.dataset.accessCard = "teacher";
      student.dataset.accessCard = "student";
      teacher.classList.add("commercial-inactive");

      const activate = (name) => {
        $$("[data-access]", switcher).forEach(b => b.classList.toggle("active", b.dataset.access === name));
        teacher.classList.toggle("commercial-inactive", name !== "teacher");
        student.classList.toggle("commercial-inactive", name !== "student");
      };
      $$("[data-access]", switcher).forEach(b => b.addEventListener("click", () => activate(b.dataset.access)));
    }

    if(cards[0]){
      const h2 = $("h2", cards[0]);
      setText(h2, "Teacher Portal");
      const p = $("p", cards[0]);
      setText(p, "Sign in to create game sessions, manage rooms and view live learning analytics.");
      if(!$(".role-kicker", cards[0])){
        const k = document.createElement("div"); k.className="role-kicker"; k.textContent="Educator access";
        cards[0].prepend(k);
      }
      const login = $("#teacherLoginBox");
      if(login && !$(".security-note", login)){
        const note=document.createElement("div");
        note.className="security-note";
        note.innerHTML='<span class="security-dot"></span><span>Teacher accounts are institution-controlled. Students join with a room code and do not need an account.</span>';
        login.appendChild(note);
      }
    }

    if(cards[1]){
      const h2 = $("h2", cards[1]);
      setText(h2, "Join a Game");
      const p = $("p", cards[1]);
      setText(p, "Enter the six-digit session code provided by your teacher. One device per team is recommended.");
      if(!$(".role-kicker", cards[1])){
        const k = document.createElement("div"); k.className="role-kicker"; k.textContent="Student team";
        cards[1].prepend(k);
      }
      const btn = $(".goldBtn", cards[1]);
      setText(btn, "Join Game");
    }

    const createBtn = $("#teacherCreateBox .primary");
    setText(createBtn, "New Game Session");
  }

  function upgradeTeacher(){
    const shell = $("#teacherView");
    if(!shell) return;

    const eyebrow = $(".teacherHero .eyebrow", shell);
    setText(eyebrow, "Live classroom session");

    const copyBtn = $$(".teacherButtons button", shell).find(b => /Copy Student Link/i.test(b.textContent));
    setText(copyBtn, "Copy Join Link");

    const exportBtn = $$(".teacherButtons button", shell).find(b => /Export CSV/i.test(b.textContent));
    setText(exportBtn, "Export Results");

    const overview = $("#tab-overview");
    if(overview && !$(".teacher-summary-strip", overview)){
      const strip = document.createElement("div");
      strip.className = "teacher-summary-strip";
      strip.innerHTML = `
        <div class="insight"><span>Teaching focus</span><b>Live formative assessment</b></div>
        <div class="insight"><span>Student experience</span><b>Simultaneous team simulation</b></div>
        <div class="insight"><span>Evidence</span><b>Attempts, errors & response time</b></div>
      `;
      overview.prepend(strip);
    }
  }

  function upgradeAdmin(){
    const view = $("#adminView");
    if(!view) return;

    const card = $(".roleCard", view);
    if(card){
      const title = $("h2", card);
      setText(title, "Platform Administration");

      const who = $("#adminWho");
      if(who && !$(".admin-topline", card)){
        const top = document.createElement("div");
        top.className = "admin-topline";
        top.innerHTML = `
          <div>
            <span class="admin-badge">Platform management</span>
          </div>
          <div class="subtle">Institution and educator access</div>
        `;
        card.insertBefore(top, card.firstChild);
      }
    }

    const ownerHeading = $$("#ownerOnlyBox h3").find(h => /Create Institution/i.test(h.textContent));
    setText(ownerHeading, "Institution Onboarding");

    const teacherHeading = $$("h3", card).find(h => /Add\s*\/\s*Update Teacher|Invite\s*\/\s*Attach Teacher/i.test(h.textContent));
    if(teacherHeading) teacherHeading.textContent = "Educator Access";

    const sendBtn = $$("#adminView button").find(b => /Send Teacher Invitation|Add\s*\/\s*Update Teacher/i.test(b.textContent));
    if(sendBtn) sendBtn.textContent = "Invite Educator";

    const newInstBtn = $$("#ownerOnlyBox button").find(b => /Create Institution/i.test(b.textContent));
    if(newInstBtn) newInstBtn.textContent = "Add Institution";
  }

  function upgradeGame(){
    const label = $("#gameView .panelLabel");
    setText(label, "Business Performance");

    const boardTitle = $("#gameView .boardTitle strong");
    setText(boardTitle, "Business Simulation");

    const sideTitle = $("#gameView .sideHead h2");
    setText(sideTitle, "Accounting Workspace");

    const sideBadge = $("#gameView .sideBadge");
    setText(sideBadge, "Current task");
  }

  function upgradeWaiting(){
    const eye = $("#waitingView .eyebrow");
    setText(eye, "Session lobby");
  }

  function init(){
    document.documentElement.classList.add("commercial-ui-v3");
    upgradeBrand();
    upgradeLanding();
    upgradeTeacher();
    upgradeAdmin();
    upgradeGame();
    upgradeWaiting();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init, {once:true});
  }else{
    init();
  }
})();
