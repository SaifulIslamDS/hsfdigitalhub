/* HSF internal client-only content brief generator. No network, storage or publication action. */
(function () {
  'use strict';
  const dataNode = document.getElementById('hsf-idea-prompt-context');
  const dialog = document.getElementById('hsf-prompt-dialog');
  if (!dataNode || !dialog) return;
  let ideas;
  try { ideas = JSON.parse(dataNode.textContent); } catch (e) { console.error('HSF prompt context unavailable', e); return; }
  const byId = new Map(ideas.map(x => [x.id, x]));
  const input = id => document.getElementById(id);
  const controls = ['hsf-prompt-platform','hsf-prompt-format','hsf-prompt-language','hsf-prompt-evidence'];
  const output = input('hsf-prompt-output');
  const status = input('hsf-prompt-status');
  let activeIdea = null;
  let lastTrigger = null;
  const programmes = {E4BL:'Education for Better Life (E4BL)',A2PHC:'Access to Primary Healthcare (A2PHC)',CAR:'Climate Action & Resilience',CROSS:'Cross-cutting'};
  const formatNames = {
    'complete':'Complete package: caption, visual, carousel, Reel and publication checklist',
    'recommended':'Format best suited to this idea',
    'post':'Single feed post with static visual',
    'carousel':'Educational carousel',
    'reel':'Short-form vertical Reel/video',
    'learning':'Learning activity / educational guide'
  };
  function actualFormat(item, selection) {
    if (selection !== 'recommended') return selection;
    const f = String(item.suggestedFormat || '').toLowerCase();
    if (/reel|video|audio/.test(f)) return 'reel';
    if (/carousel|graphic|chart|map|card|scorecard|diagram/.test(f)) return 'carousel';
    if (/checklist|guide|learning|classroom/.test(f)) return 'learning';
    return 'post';
  }
  function formatInstructions(format) {
    if (format === 'post') return 'Produce: one publishable-if-verified feed caption (short and medium versions), one static-visual creative brief, a concise visual-generation/illustration prompt, suggested alt text, and final editorial checks. Preferred visual frame 4:5 (1080 × 1350) unless platform requires otherwise.';
    if (format === 'carousel') return 'Produce: a 5–7 slide carousel. For EACH slide include its role, short editable headline, concise on-image wording, evidence/source needed, layout direction, suggested visual/illustration prompt and accessible alt text. Deliver a matching feed caption. Prefer readable 4:5 slides (1080 × 1350), but verify current platform specifications before production.';
    if (format === 'reel') return 'Produce: a 20–40 second vertical Reel plan with time-coded shot-by-shot storyboard, opening 2-second hook, spoken narration, exact subtitles/on-screen text, authentic B-roll guidance, audio/consent notes, cover thumbnail headline, feed caption and alt/accessibility notes. Default portrait 9:16, but verify current platform requirements. Do not imply HSF filmed scenes it has not actually filmed.';
    if (format === 'learning') return 'Produce: an age-appropriate teaching tip or activity with objective, learner level, materials, 3–5 classroom/home steps, teacher or caregiver tips, answer key/example, short publishable-if-verified caption, accessible single-card or short-carousel visual directions, and an optional short Reel adaptation. Verify learning accuracy and curriculum relevance.';
    return 'Produce a coordinated content package: (A) publishable-if-verified feed caption in two lengths, (B) single-image/photo-card layout and image/illustration prompt plus alt text, (C) 5–7 slide carousel with per-slide text, visuals and alt text, (D) 20–40 second vertical Reel with shot list, voiceover and on-screen captions, (E) appropriate thumbnail/cover and accessibility guidance, (F) optional Stories adaptation only if relevant. All must tell the same evidence-supported story without redundant repetition.';
  }
  function buildPrompt(idea) {
    const platform = input('hsf-prompt-platform').value;
    const language = input('hsf-prompt-language').value;
    const choice = input('hsf-prompt-format').value;
    const format = actualFormat(idea, choice);
    const evidence = input('hsf-prompt-evidence').value.trim();
    const series = idea.editorialSeries || 'No dedicated editorial subseries';
    const special = idea.bank === 'KDI'
      ? 'KDI research rule: treat every research question, proposed solution and source lead as a hypothesis or research lead, not an established fact. Find the original primary source, precise page/table, statistic definition, date and Bangladesh-relevant geographic scope. Distinguish external data from HSF programme results. If browsing or source access is unavailable, label findings [SOURCE REQUIRED] and supply a verification checklist. Do not cite an article you have not actually accessed.'
      : 'PSC field-story rule: never invent an HSF activity, classroom moment, participant experience, case study, location, dialogue, numerical result, field photo or quotation. Produce a publishable caption ONLY when actual, approved field documentation is supplied; otherwise prepare an accurately labelled [FIELD EVIDENCE REQUIRED] draft with placeholders and a list of evidence to collect. Participation is not proof of a learning or health outcome.';
    const safeguards = idea.programme === 'E4BL'
      ? 'E4BL: require teacher confirmation, educational accuracy and informed child safeguarding checks. Do not identify children by name or publish recognisable child faces or voices without appropriate documented permissions. Learning enjoyment does not establish improved proficiency.'
      : idea.programme === 'A2PHC'
      ? 'A2PHC: protect patient confidentiality and informed consent; avoid diagnoses, treatment guarantees or personalised medical advice. All health guidance must be reviewed by an appropriately qualified clinician and follow authoritative Bangladesh/WHO guidance.'
      : idea.programme === 'CAR'
      ? 'Climate Action: avoid exaggerated disaster-risk claims, speculative projections presented as certainty, and unsupported national statistics; identify the original assessment, time range, location and uncertainty. Keep community resilience solutions practical and locally relevant.'
      : 'Cross-cutting: protect vulnerable community members, confirm official statuses/partnerships, and do not imply UN or government endorsement without evidence.';
    const languageRule = language === 'Bangla' ? 'Write natural, plain, culturally appropriate Bangla for audiences in Bangladesh; use English terms only when they improve clarity.' : language === 'English' ? 'Use accessible, warm, professionally edited English appropriate for Bangladeshi communities and international partners.' : 'Write the primary content in natural Bangla and provide a concise, accurate English adaptation; avoid literal translations.';
    return [
      'HSF CONTENT PRODUCTION MASTER BRIEF — COPY INTO A RESEARCH/CONTENT-CREATION AI',
      'Prepared for Human Safety Foundation (HSF) | Social Communication Ecosystem v4.0',
      '',
      '1. EDITORIAL ROLE AND PURPOSE',
      'Act as a senior nonprofit communications editor, responsible programme specialist, fact-checker, safeguarding reviewer, social-search strategist, and accessible visual storyteller. Prepare a high-quality, original, useful content-production package for HSF, not generic AI marketing copy. Planning & Compiled by: Saiful Islam.',
      '',
      '2. EXACT ASSIGNED IDEA (DO NOT CHANGE OR SUBSTITUTE)',
      'Idea ID: ' + idea.id,
      'Idea title: ' + idea.title,
      'Bank / stream: ' + (idea.bank === 'KDI' ? 'Knowledge, Data & Insight / HSF Knowledge & Awareness' : 'Programme Stories & Communication / HSF in Action'),
      'Primary programme: ' + (programmes[idea.programme] || idea.programme),
      'Editorial family/topic: ' + idea.group,
      'Editorial series: ' + series,
      'Research question or story angle: ' + idea.focus,
      'Proposed practical response / minimum evidence: ' + idea.response,
      'Suggested original visual format: ' + idea.suggestedFormat,
      'Source leads / review requirements: ' + (idea.sourcesOrReview || 'None recorded; seek original evidence'),
      'Idea classification: ' + (idea.status === 'proposed' ? 'PROPOSED IDEA — pending idea-level review' : 'EDITORIAL IDEA APPROVED — publication NOT approved'),
      'Cross-cutting topic discovery tags: ' + (idea.tags || []).join(', '),
      '',
      '3. TARGET AND DELIVERABLE',
      'Primary channel: ' + platform,
      'Output format: ' + (formatNames[choice] || choice) + (choice === 'recommended' ? ' → ' + formatNames[format] : ''),
      'Publication language: ' + language + '. ' + languageRule,
      'Target audience: Bangladesh-based learners, caregivers, teachers, families and communities as relevant to the exact idea. Adapt reading level and tone to the intended audience.',
      'Evidence supplied by HSF staff (UNVERIFIED UNTIL CHECKED): ' + (evidence || '[NO FIELD NOTES OR SOURCE LINKS SUPPLIED — DO NOT INVENT]'),
      '',
      '4. NON-NEGOTIABLE EVIDENCE AND SAFETY GATE',
      special,
      safeguards,
      'Do not invent figures, success rates, patient counts, schools, dates, quotes, human stories, photographs, impact statements, sources, website URLs or endorsements. Distinguish verified, estimated, proposed and missing information. Never expose confidential ERP/MEAL, learner, patient, HR or finance records. Do not generate fabricated documentary photographs of identifiable HSF beneficiaries. Use clearly illustrative graphics where approved real media is unavailable.',
      'If source retrieval is possible, check original up-to-date authoritative documents and supply working source URLs, dates, page/table references and claim-to-source mapping. If not possible, say so clearly. Include [VERIFY BEFORE PUBLICATION] next to any unresolved substantive claim. Do not publish without HSF technical, safeguarding and management approval.',
      '',
      '5. SEARCH DISCOVERY AND REAL AUDIENCE VALUE (NO GUARANTEED REACH)',
      'Identify 1 natural primary Bangladesh-relevant search phrase plus 3–5 secondary phrases a real reader might use, including appropriate Bangla variants. Provide a practical search-intent note. Write a factual, specific first-line hook and first-two-line summary, not clickbait. Use keywords naturally in opening text, an informative visual title, captions, subtitles, alt text and appropriate descriptive filename. Suggest only 3–6 directly relevant hashtags; avoid spammy repetition and engagement bait. Provide an optional non-manipulative invitation to comment or save only if genuinely useful. Prioritise originality, clear visual hierarchy, readability, accurate captions and accessible design. Do not promise virality or guaranteed ranking.',
      '',
      '6. DELIVERABLES',
      formatInstructions(format),
      'Keep HSF branding aligned with the approved Brand Identity & Design System v2.4. Do not introduce a competing logo, palette or unrelated NGO visual identity. Write actual draft copy, not just general recommendations. For visuals, provide art-direction and production/generation prompts with clearly labelled illustration versus real photography. Never assert that visuals have been created or filmed.',
      '',
      '7. OUTPUT STRUCTURE (USE THESE HEADINGS)',
      'A. Editorial readiness verdict: READY FOR TECHNICAL REVIEW / DRAFT NEEDS EVIDENCE (explain why).',
      'B. Verified facts, exact source links, dates, claim-to-evidence table and outstanding questions.',
      'C. Audience, platform, search intent, natural keyword plan and the best opening hook.',
      'D. Complete copy-ready primary caption plus alternative shorter hook/caption.',
      'E. Production-ready visual, carousel and/or Reel package as requested, including text, layout, storyboard, visual prompts and alt text.',
      'F. Brief, relevant hashtags, non-manipulative CTA and publishing checklist.',
      'G. Quality checklist: accessibility, curriculum/medical/climate technical review as relevant, child/patient privacy, consent and HSF management sign-off.',
      'H. Post-publication measurement proposal: meaningful reach, saves/shares, watch-through (if video), accessible responses and documented feedback. No attribution of outcome/impact without MEAL evidence.',
      '',
      '8. FINAL INSTRUCTION',
      'Start with a readiness check. If essential evidence is missing, generate the strongest clearly marked draft and a short actionable evidence-request list; never invent or silently fill gaps. Keep the finished language human, natural and HSF-specific, with no misleading sensational claims or keyword stuffing.'
    ].join('\n');
  }
  function update() {
    if (!activeIdea) return;
    output.value = buildPrompt(activeIdea);
    status.textContent = 'Prompt ready for review and copying. No content has been published.';
  }
  document.getElementById('ideas').addEventListener('click', function(event) {
    const btn = event.target.closest('button[data-prompt-id]');
    if (!btn) return;
    activeIdea = byId.get(btn.dataset.promptId);
    if (!activeIdea) return;
    lastTrigger = btn;
    input('hsf-prompt-title').textContent = activeIdea.id + ' — ' + activeIdea.title;
    input('hsf-prompt-format').value = 'complete';
    input('hsf-prompt-evidence').value = '';
    update();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else { dialog.setAttribute('open',''); }
    dialog.scrollTop = 0;
    input('hsf-prompt-close').focus({preventScroll:true});
  });
  controls.forEach(id => input(id).addEventListener(id === 'hsf-prompt-evidence' ? 'input' : 'change', update));
  input('hsf-prompt-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { activeIdea = null; if (lastTrigger) lastTrigger.focus(); });
  input('hsf-prompt-copy').addEventListener('click', async function() {
    const value = output.value;
    let copied = false;
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(value); copied = true; } } catch (_e) {}
    if (!copied) {
      output.focus(); output.select();
      try { copied = document.execCommand('copy'); } catch (_e) {}
    }
    status.textContent = copied ? 'Prompt copied. Paste it into your preferred AI assistant.' : 'Copy unavailable in this browser. Select the prompt and use Ctrl+C.';
  });
})();
