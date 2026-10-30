/* HSF public-safe content idea to offline Design Studio bridge; no network, no source claims approved. */
(function () {
  'use strict';
  const node = document.getElementById('hsf-idea-prompt-context');
  const board = document.getElementById('ideas');
  if (!node || !board) return;
  let list;
  try { list = JSON.parse(node.textContent); } catch (_) { return; }
  const ideas = new Map(list.map(item => [item.id, item]));
  board.querySelectorAll('article.idea[data-bank]').forEach(card => {
    const area = card.querySelector('.idea-actions');
    if (!area || !ideas.has(card.id)) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hsf-design-brief';
    btn.dataset.briefId = card.id;
    btn.textContent = '↧ Download design brief';
    btn.setAttribute('aria-label', 'Download public-safe Design Studio brief for ' + card.id);
    area.appendChild(btn);
  });
  board.addEventListener('click', event => {
    const button = event.target.closest('button[data-brief-id]');
    if (!button) return;
    const idea = ideas.get(button.dataset.briefId);
    if (!idea) return;
    const series = {'Inside Our Classroom':'inside-our-classroom','Learn with E4BL':'learn-with-e4bl'};
    // Source leads remain editorial suggestions, NOT validated public statistics.
    const brief = {
      schema:'hsf-public-design-brief/v1', organisation:'Human Safety Foundation',
      idea_id:idea.id, bank:idea.bank, programme:idea.programme,
      title:idea.title, editorial_group:idea.group,
      editorial_series:series[idea.editorialSeries] || '',
      focus_question_or_story_angle:idea.focus,
      response_or_evidence_to_investigate:idea.response,
      suggested_format:idea.suggestedFormat,
      tags:Array.isArray(idea.tags)?idea.tags:[],
      idea_review_status:idea.status,
      publication_approved:false, factual_claims_verified:false,
      content_state:'DRAFT_NOT_FOR_PUBLICATION',
      note:'Public-safe editorial concept only. HSF staff must verify exact claims, protect people and confirm final management approval of the artwork.'
    };
    const blob = new Blob([JSON.stringify(brief, null, 2)+'\n'], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url;a.download='hsf-'+idea.id.toLowerCase()+'-design-brief.json';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
})();
