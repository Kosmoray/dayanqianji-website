/* Local hook only: no storage, network, message content or contact values. */
(() => {
  'use strict';
  const allowed = new Set(['phone_click', 'wechat_copy', 'message_copy',
    'contact_open', 'sample_download', 'qr_download']);
  window.dayanTrack = (name, fields = {}) => {
    if (!allowed.has(name)) return;
    const detail = {name};
    if (['diagnosis', 'geo', 'training'].includes(fields.service)) detail.service = fields.service;
    if (['success', 'manual'].includes(fields.status)) detail.status = fields.status;
    document.dispatchEvent(new CustomEvent('dayan:contact-event', {detail}));
  };
  function openDetailAnchor() {
    const id = location.hash.slice(1);
    if (!id.startsWith('details-')) return;
    const target = document.getElementById(id);
    if (target?.tagName === 'DETAILS') target.open = true;
  }
  window.addEventListener('hashchange', openDetailAnchor);
  openDetailAnchor();
  document.addEventListener('click', async e => {
    const el = e.target.closest('a,button');
    if (!el) return;
    if (el.matches('a[href^="#details-"]')) {
      const target = document.getElementById(el.getAttribute('href').slice(1));
      if (target) target.open = true;
    }
    if (el.matches('[data-contact]')) window.dayanTrack('contact_open');
    if (el.matches('a[href^="tel:"]')) window.dayanTrack('phone_click');
    if (el.matches('a[download$="二维码.png"]')) window.dayanTrack('qr_download');
    if (!el.matches('[data-copy-wechat]')) return;
    const value = el.dataset.copyWechat;
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        copied = true;
      }
    } catch (_) {}
    if (!copied) {
      const field = document.createElement('textarea');
      field.value = value;
      field.className = 'copy-fallback';
      (el.closest('dialog') || document.body).append(field);
      field.focus(); field.select();
      try {copied = document.execCommand('copy');} catch (_) {}
      field.remove(); el.focus();
    }
    const status = el.closest('.public-contact').querySelector('[role="status"]');
    status.textContent = copied ? '微信号已复制，尚未发送消息。' : '请选中显示的微信号手动复制。';
    window.dayanTrack('wechat_copy', {status: copied ? 'success' : 'manual'});
  });
})();

(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const names = {diagnosis:'企业 AI 首诊',geo:'GEO 诊断',training:'企业 AI 培训'};
  let selected = 'diagnosis', sampleKey = 'diagnosis', stack = [];
  const samples = {"diagnosis": {"title": "销售咨询整理 · 第一件事怎么试", "intro": "虚构情境：销售需要把客户聊天里的需求整理成表格，容易漏掉规格和交期。以下只展示建议的写法，不代表已经验证有效。", "rows": [["现有做法", "销售读聊天记录，手动填写需求表。实际用时和漏项情况还需记录，不凭印象判断效果。"], ["建议先试", "使用已授权、已脱敏的咨询样本，试做需求提取与缺项提醒，由销售逐项核对。"], ["先不做什么", "不改整套客户管理系统，不自动对外发送报价，不把不明确的客户要求补成事实。"], ["开始需要", "一份待填写的需求表、可用于测试的样本、熟悉产品和销售流程的同事。"], ["怎样检查", "与原来的做法比较整理用时、漏项、错误和人工修改量。需要的指标与试做范围先约定。"], ["下一步决定", "根据记录选择继续、调整或停下。资料不足或错误难以控制时，先补条件，不直接扩大使用。"]]}, "geo": {"title": "搜索与 AI 回答 · 诊断记录怎么写", "intro": "虚构情境：一家包装企业能做小批量定制，但公开介绍没有讲清适用条件。这里没有实际检索，也不展示模拟排名。", "rows": [["客户问法", "示例：“能做小批量定制的包装供应商有哪些？”正式查询应先确认目标客户和问题范围。"], ["原始记录", "交付记录包括查询平台、时间、客户问法、原始回答和引用页面，便于后续复查。"], ["核对事实", "检查公司是否出现、产品和业务介绍是否准确。与企业确认过的资料比对，而不是把 AI 回答当作事实。"], ["假设缺口", "公开资料只有“包装生产”，没有说明起订量、供货范围与适用条件。这个缺口仅为示例。"], ["建议次序", "先核实事实：官网补产品条件，自媒体讲常见问题，第三方按受众选择并核对出处。现有官网能承接就沿用，建设或改版放在明确缺口之后。"], ["后续与复查", "按需要准备内容、选择渠道、留存发布链接并复查，实际范围另议。复查保留问法、平台、时间和回答，分别记录刊发、索引、提及、引用与合格咨询。"]]}, "training": {"title": "会议整理 · 一份能核对的作业", "intro": "练习内容为虚构，不涉及真实会议。目标不是让 AI 多写几句，而是能发现它多写了什么、漏掉了什么。", "rows": [["练习原文", "“小林周五前核对产品参数。报价谁来发，等负责人确认。”"], ["示例初稿", "“小林周五前核对参数，并发送报价。”这是一段刻意保留错误的练习文本，不是实时模型输出。"], ["找出问题", "原文没有把报价发送工作分配给小林，也没有给出报价发送时间。初稿擅自补了职责。"], ["修改后", "待办一：小林周五前核对产品参数。待办二：报价发送人和发送时间待负责人确认。"], ["练习要求", "先用获准使用的材料整理待办，逐项标出负责人、时间和原文依据。不明确的字段写“待确认”。"], ["检查与复用", "核对有无遗漏、捏造负责人或期限；留下约定的作业、操作说明和复用模板。实际课程按岗位、人数与工具条件确认。"]]}};
  function switchService(key, writeHash = false) {
    if (!names[key]) return;
    selected = key;
    $$('[data-service]').forEach(b => {
      const on = b.dataset.service === key;
      b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1;
    });
    $$('.service-panel').forEach(p => p.hidden = p.id !== 'panel-' + key);
    if (writeHash) history.replaceState(null, '', '#service-' + key);
  }
  $$('[data-service]').forEach(b => b.addEventListener('click', () => switchService(b.dataset.service, true)));
  $('.service-tabs')?.addEventListener('keydown', e => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
    e.preventDefault();
    const buttons = $$('[data-service]'), current = buttons.indexOf(document.activeElement);
    let i = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : (current + (e.key === 'ArrowRight' ? 1 : -1) + 3) % 3;
    switchService(buttons[i].dataset.service, true); buttons[i].focus();
  });
  function route() {
    const key = location.hash.replace('#service-', '');
    if (!location.hash.startsWith('#service-') || !names[key]) return;
    switchService(key); $('#services').scrollIntoView({block:'start'});
  }
  window.addEventListener('hashchange', route);
  $$('a[href^="#service-"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); switchService(a.hash.slice(9), true); $('#services').scrollIntoView({block:'start'});
  }));
  $$('[data-step]').forEach(b => b.addEventListener('click', () => {
    $$('[data-step]').forEach(t => t.setAttribute('aria-pressed', String(t === b)));
    $$('.geo-step').forEach(p => p.hidden = p.id !== 'step-' + b.dataset.step);
  }));
  $('#reveal')?.addEventListener('click', () => {
    const open = $('#exercise-answer').hidden;
    $('#exercise-answer').hidden = !open; $('#reveal').setAttribute('aria-expanded', String(open));
    $('#reveal').innerHTML = open ? '收起核对说明 <span aria-hidden="true">−</span>' : '看看哪里需要改 <span aria-hidden="true">＋</span>';
  });
  function showDialog(id, trigger) {
    const dialog = $('#' + id);
    if (stack.some(s => s.dialog === dialog)) return;
    if (stack.length) stack.at(-1).dialog.close();
    stack.push({dialog, trigger});
    dialog.showModal(); document.body.classList.add('lock'); dialog.scrollTop = 0;
    dialog.querySelector('[data-close]').focus({preventScroll:true});
  }
  function closeDialog() {
    const previous = stack.pop();
    if (!previous) return;
    previous.dialog.close();
    if (stack.length) {
      stack.at(-1).dialog.showModal();
      if (previous.trigger?.isConnected) previous.trigger.focus({preventScroll:true});
    } else {
      document.body.classList.remove('lock');
      previous.trigger?.focus({preventScroll:true});
    }
  }
  function messageFor(topic) {
    if (topic === '企业 AI 首诊') return '可扬你好，我想了解企业 AI 首诊，先聊聊业务现状和适合尝试的工作。';
    if (topic === 'GEO 诊断') return '可扬你好，我想了解 GEO 诊断，看看客户在搜索和 AI 回答里能看到哪些公司信息。';
    if (topic === '企业 AI 培训') return '可扬你好，我想了解企业 AI 培训，沟通岗位练习、课程范围、费用和时间安排。';
    if (topic === 'FDE 共创实施') return '可扬你好，我想讨论一条业务流程的 FDE 实施，先确认材料、系统条件和双方责任。';
    return '可扬你好，我想聊聊公司使用 AI 的具体需求，还没确定适合哪项服务。';
  }
  const drafts = {};
  let previousTopic = $('#topic').value;
  function setTopic(topic) {
    drafts[previousTopic] = $('#message').value;
    $('#topic').value = [...$('#topic').options].some(o => o.value === topic) ? topic : '还没确定，先聊聊情况';
    previousTopic = $('#topic').value;
    $('#message').value = drafts[previousTopic] || messageFor(previousTopic);
    $('#copy-status').textContent = '文字仅留在当前页面，不会自动发送或保存。';
  }
  $('#message').value = messageFor(previousTopic);
  $('#topic').addEventListener('change', () => setTopic($('#topic').value));
  function openSample(key, trigger) {
    sampleKey = key;
    const sample = samples[key];
    $('#sample-title').textContent = sample.title;
    const box = $('#sample-content');
    box.replaceChildren(); box.className = 'sample-detail';
    const intro = document.createElement('p'); intro.textContent = sample.intro; box.append(intro);
    const dl = document.createElement('dl');
    sample.rows.forEach(([label, text]) => {
      const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = label; dd.textContent = text; row.append(dt, dd); dl.append(row);
    });
    box.append(dl); $('#sample-contact').dataset.contact = names[key];
    showDialog('sample-dialog', trigger);
  }
  document.addEventListener('click', e => {
    const el = e.target.closest('button,a');
    if (!el) return;
    if (el.hasAttribute('data-contact')) {
      setTopic(el.dataset.contact || '还没确定，先聊聊情况'); showDialog('contact-dialog', el);
    } else if (el.hasAttribute('data-sample')) openSample(el.dataset.sample, el);
    else if (el.hasAttribute('data-photo')) {
      if (typeof $('#photo-dialog').showModal !== 'function') return;
      e.preventDefault();
      const img = document.createElement('img');
      img.src = el.href;
      img.alt = el.querySelector('img').alt;
      $('#photo-title').textContent = img.alt;
      $('#photo-dialog .photo-body img')?.remove();
      $('#photo-dialog .photo-body').prepend(img);
      showDialog('photo-dialog', el);
    }
    else if (el.hasAttribute('data-close')) closeDialog();
  });
  $$('dialog').forEach(d => {
    d.addEventListener('cancel', e => {e.preventDefault(); closeDialog();});
    d.addEventListener('click', e => {
      if (e.target !== d) return;
      const r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog();
    });
  });
  $('#copy-message').addEventListener('click', async () => {
    const text = $('#message').value;
    if (!text.trim()) {$('#copy-status').textContent = '先写一点内容，再复制。'; return;}
    let copied = false;
    try {if (navigator.clipboard?.writeText) {await navigator.clipboard.writeText(text); copied = true;}} catch (_) {}
    if (!copied) {
      $('#message').focus(); $('#message').select();
      try {copied = document.execCommand('copy');} catch (_) {}
    }
    $('#copy-status').textContent = copied ? '已复制。可切换到微信粘贴；尚未发送。' : '未能自动复制。请长按或全选上方文字，手动复制到微信。';
    window.dayanTrack('message_copy', {status: copied ? 'success' : 'manual'});
  });
  $('#download-sample').addEventListener('click', () => {
    const s = samples[sampleKey];
    window.dayanTrack('sample_download', {service: sampleKey});
    const text = '大衍千机 | ' + s.title + '\n内容示例，非客户案例或成效。\n\n' + s.intro + '\n\n' + s.rows.map(([k,v]) => k + '\n' + v).join('\n\n') + '\n\n具体服务范围、费用和时间需另行确认。';
    const url = URL.createObjectURL(new Blob(['\ufeff' + text], {type:'text/plain;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = '大衍千机-' + names[sampleKey] + '-内容示例.txt'; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  });
  route();
})();
