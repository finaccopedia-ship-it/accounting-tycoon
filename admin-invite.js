/*
Accounting Tycoon v2.2 — Teacher Invitation add-on

Add this file to the same GitHub folder as index.html and config.js,
then add this line immediately before </body> in index.html:

<script src="admin-invite.js"></script>

This file:
1) changes "Add / Update Teacher" to "Invite Teacher"
2) securely calls the Supabase Edge Function "invite-teacher"
3) shows a password setup screen when an invited teacher follows the invite link
*/

(function () {
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function setInviteUI() {
    try {
      const headings = [...document.querySelectorAll('#adminView h3')];
      const teacherHeading = headings.find(h => /Add\s*\/\s*Update Teacher/i.test(h.textContent || ''));
      if (teacherHeading) teacherHeading.textContent = 'Invite / Attach Teacher';

      const paragraphs = [...document.querySelectorAll('#adminView p.subtle')];
      const help = paragraphs.find(p => /must already have a login account/i.test(p.textContent || ''));
      if (help) {
        help.textContent =
          'Enter the teacher email, institution and role. Accounting Tycoon will send a secure invitation email automatically. If the email already has a Supabase login, the existing account will be attached to the selected institution.';
      }

      const button = document.querySelector('#adminView button[onclick="addTeacher()"]');
      if (button) button.textContent = 'Send Teacher Invitation';

      const emailInput = document.getElementById('teacherAddEmail');
      if (emailInput) emailInput.placeholder = 'teacher@school.edu.au';
    } catch (e) {
      console.warn('Teacher invite UI upgrade:', e);
    }
  }

  async function getFunctionErrorMessage(error) {
    let message = error?.message || 'Teacher invitation failed.';
    try {
      if (error?.context && typeof error.context.clone === 'function') {
        const response = error.context.clone();
        const body = await response.json();
        if (body?.error) message = body.error;
        else if (body?.message) message = body.message;
      }
    } catch (_) {}
    return message;
  }

  window.addTeacher = async function addTeacher() {
    const statusEl = document.getElementById('teacherAddStatus');

    try {
      if (typeof backendMode !== 'undefined' && backendMode !== 'supabase') {
        throw new Error('Supabase must be connected before teacher invitations can be sent.');
      }
      if (typeof teacherAuthorized !== 'undefined' && !teacherAuthorized) {
        throw new Error('Sign in as an authorised administrator first.');
      }

      const email = (document.getElementById('teacherAddEmail')?.value || '').trim().toLowerCase();
      const institutionId = document.getElementById('teacherAddInst')?.value || '';
      const role = document.getElementById('teacherAddRole')?.value || 'teacher';

      if (!email || !institutionId) {
        throw new Error('Enter the teacher email and choose an institution.');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Enter a valid email address.');
      }

      if (statusEl) {
        statusEl.textContent = 'Sending invitation…';
        statusEl.className = 'statusMsg';
      }

      const { data, error } = await sb.functions.invoke('invite-teacher', {
        body: {
          email,
          institution_id: institutionId,
          role
        }
      });

      if (error) {
        throw new Error(await getFunctionErrorMessage(error));
      }
      if (!data?.ok) {
        throw new Error(data?.error || 'Teacher invitation failed.');
      }

      if (statusEl) {
        statusEl.textContent =
          data.action === 'invited'
            ? `Invitation sent to ${email}. The teacher has also been attached to the selected institution.`
            : `${email} already has a login account. The account has been attached/updated successfully.`;
        statusEl.className = 'statusMsg good';
      }

      const input = document.getElementById('teacherAddEmail');
      if (input) input.value = '';

      if (typeof loadTeachers === 'function') await loadTeachers();
    } catch (e) {
      if (statusEl) {
        statusEl.textContent = 'Error: ' + (e?.message || String(e));
        statusEl.className = 'statusMsg bad';
      }
    }
  };

  function inviteDetected() {
    const all = (location.search + '&' + location.hash).toLowerCase();
    return all.includes('type=invite') || all.includes('type%3dinvite');
  }

  function injectInviteModal() {
    if (document.getElementById('teacherInviteOverlay')) return;

    const style = document.createElement('style');
    style.textContent = `
      #teacherInviteOverlay{
        position:fixed;inset:0;z-index:99999;background:rgba(10,32,48,.74);
        display:grid;place-items:center;padding:20px
      }
      #teacherInviteCard{
        width:min(520px,100%);background:#fff;border-radius:20px;padding:26px;
        box-shadow:0 24px 70px rgba(0,0,0,.3);font-family:inherit;color:#14283b
      }
      #teacherInviteCard h2{margin:0 0 7px;color:#15324b}
      #teacherInviteCard p{color:#6e8090;line-height:1.5;font-size:13px}
      #teacherInviteCard label{
        display:block;font-size:10px;text-transform:uppercase;letter-spacing:.1em;
        font-weight:850;color:#6b7d8e;margin:13px 0 6px
      }
      #teacherInviteCard input{
        width:100%;padding:12px;border:1px solid #ccd9e0;border-radius:10px;font:inherit
      }
      #teacherInviteCard button{
        margin-top:16px;width:100%;border:0;border-radius:11px;padding:12px;
        color:white;background:linear-gradient(135deg,#0f8b8d,#16aaa4);
        font-weight:850;cursor:pointer
      }
      #teacherInviteResult{margin-top:12px;font-size:12px;line-height:1.45}
      #teacherInviteResult.ok{color:#23764f}
      #teacherInviteResult.err{color:#aa4c45}
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'teacherInviteOverlay';
    overlay.innerHTML = `
      <div id="teacherInviteCard">
        <div style="font-size:38px">👩‍🏫</div>
        <h2>Complete your Accounting Tycoon invitation</h2>
        <p>Create a password for your teacher account. After this, you can sign in from the Teacher Access section using your email and password.</p>

        <label>New password</label>
        <input id="invitePassword1" type="password" autocomplete="new-password" minlength="8" placeholder="At least 8 characters">

        <label>Confirm password</label>
        <input id="invitePassword2" type="password" autocomplete="new-password" minlength="8" placeholder="Repeat password">

        <button id="completeInviteBtn" type="button">Activate Teacher Account</button>
        <div id="teacherInviteResult"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('completeInviteBtn').addEventListener('click', completeTeacherInvitation);
  }

  async function completeTeacherInvitation() {
    const result = document.getElementById('teacherInviteResult');
    const btn = document.getElementById('completeInviteBtn');

    try {
      const p1 = document.getElementById('invitePassword1').value;
      const p2 = document.getElementById('invitePassword2').value;

      if (p1.length < 8) throw new Error('Use a password of at least 8 characters.');
      if (p1 !== p2) throw new Error('The two passwords do not match.');

      btn.disabled = true;
      result.className = '';
      result.textContent = 'Activating account…';

      for (let i = 0; i < 20; i++) {
        if (typeof sb !== 'undefined' && sb) break;
        await sleep(150);
      }
      if (typeof sb === 'undefined' || !sb) {
        throw new Error('Supabase is not ready. Refresh the invitation link and try again.');
      }

      let session = null;
      for (let i = 0; i < 20; i++) {
        const res = await sb.auth.getSession();
        session = res?.data?.session || null;
        if (session && !session.user?.is_anonymous) break;
        await sleep(150);
      }

      if (!session || session.user?.is_anonymous) {
        throw new Error('The invitation session could not be verified. The invitation may have expired; ask the administrator to send a new invite.');
      }

      const { error } = await sb.auth.updateUser({ password: p1 });
      if (error) throw error;

      try {
        actorId = session.user.id;
        if (typeof refreshTeacherAuth === 'function') await refreshTeacherAuth();
      } catch (_) {}

      history.replaceState({}, document.title, location.pathname);

      result.className = 'ok';
      result.innerHTML = '✅ Teacher account activated. You are signed in. You can close this message and use Accounting Tycoon.';
      btn.textContent = 'Continue to Accounting Tycoon';
      btn.disabled = false;
      btn.onclick = () => {
        document.getElementById('teacherInviteOverlay')?.remove();
        location.reload();
      };
    } catch (e) {
      btn.disabled = false;
      result.className = 'err';
      result.textContent = 'Error: ' + (e?.message || String(e));
    }
  }

  async function initialiseUpgrade() {
    setInviteUI();

    if (inviteDetected()) {
      injectInviteModal();
    }

    const observer = new MutationObserver(() => setInviteUI());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseUpgrade);
  } else {
    initialiseUpgrade();
  }
})();
