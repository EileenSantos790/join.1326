/**
 * Handle drag start on a task card; prepare placeholder and mark dragging.
 * @param {DragEvent} ev
 */
function onDragStart(ev) {
    const card = ev.currentTarget;
    draggedTaskId = card.id;
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData('text/plain', draggedTaskId);
    card.classList.add('dragging');
    dropPlaceholder.style.height = card.offsetHeight + 'px';
    dropPlaceholder.style.width = '100%';
}


/**
 * Handle drag end; clear dragging styles and remove placeholder.
 * @param {DragEvent} ev
 */
function onDragEnd(ev) {
    const card = ev.currentTarget;
    card.classList.remove('dragging');
    if (dropPlaceholder.parentElement) dropPlaceholder.parentElement.removeChild(dropPlaceholder);
    draggedTaskId = null;
}


/**
 * Handle drag over a board lane to place the placeholder relative to cards.
 * @param {DragEvent} ev
 */
function onDragOver(ev) {
    ev.preventDefault(); ev.dataTransfer.dropEffect = 'move'; let container = null; const ct = ev.currentTarget;
    if (ct.classList && ct.classList.contains('boardLaneBody')) { container = ct; } else if (ct.id && ct.id.startsWith('spaceHolder')) { const mappedId = ct.id.replace('spaceHolder', 'board'); container = document.getElementById(mappedId); } else { container = ct.closest('.boardLaneBody'); }
    if (!container) return;
    container.classList.add('dropActive');
    container.classList.remove('dropAtEnd');
    container.querySelectorAll('.insertionBefore').forEach(el => el.classList.remove('insertionBefore'));
    const afterElement = getDragAfterElement(container, ev.clientY);
    if (afterElement == null) {
        if (dropPlaceholder.parentElement !== container) container.appendChild(dropPlaceholder); else container.appendChild(dropPlaceholder);
        container.classList.add('dropAtEnd');
    } else { afterElement.classList.add('insertionBefore'); if (afterElement.previousSibling !== dropPlaceholder) { container.insertBefore(dropPlaceholder, afterElement); }}
}


/**
 * Handle drop; apply new status and re-render list in target lane.
 * @param {DragEvent} ev
 */
async function onDrop(ev) {
    ev.preventDefault(); let container = null; const ct = ev.currentTarget;
    if (ct.classList && ct.classList.contains('boardLaneBody')) { container = ct; } else if (ct.id && ct.id.startsWith('spaceHolder')) { const mappedId = ct.id.replace('spaceHolder', 'board'); container = document.getElementById(mappedId); } else { container = ct.closest('.boardLaneBody'); }
    if (!container) return;
    const targetStatus = container.dataset.status || '';
    const droppedId = ev.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!droppedId) return;
    const dragging = document.getElementById(droppedId);
    if (dragging && dropPlaceholder.parentElement === container) { container.insertBefore(dragging, dropPlaceholder); } else if (dragging && !dropPlaceholder.parentElement) {  container.appendChild(dragging); }
    const byId = new Map(allTasks.map(t => [t.id, t])); Array.from(container.querySelectorAll('.boardCardContainer')).forEach(el => { const t = byId.get(el.id); if (t) t.status = targetStatus; });
    try { await fetch(`${BASE_URL}tasks/${droppedId}.json`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: targetStatus }) }); } catch (e) { console.error('Failed to update task status:', e); }
    if (dropPlaceholder.parentElement) dropPlaceholder.parentElement.removeChild(dropPlaceholder);
    container.classList.remove('dropActive', 'dropAtEnd'); container.querySelectorAll('.insertionBefore').forEach(el => el.classList.remove('insertionBefore')); renderBoard(allTasks);
}


/**
 * Find the card element that should follow the dragged placeholder.
 * @param {HTMLElement} container Lane container element
 * @param {number} y Current pointer Y screen coordinate
 * @returns {HTMLElement|null}
 */
function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll('.boardCardContainer:not(.dragging)')];
    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - (box.top + box.height / 2);
        if (offset < 0 && offset > closest.offset) { return { offset, element: child }; } else { return closest; }
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}


/**
 * Remove drag styles when leaving a lane with the dragged item.
 * @param {DragEvent} ev
 */
function onDragLeave(ev) {
    const lane = ev.currentTarget;
    if (lane && lane.classList) { lane.classList.remove('dropActive'); lane.classList.remove('dropAtEnd'); lane.querySelectorAll('.insertionBefore').forEach(el => el.classList.remove('insertionBefore')); }
}
