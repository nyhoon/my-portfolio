const viewButtons = document.querySelectorAll('[data-view]');
const previews = document.querySelectorAll('img[data-variant]');
const labels = {
    profile: ['프로필', '프로필, 연락처와 학력, 첫 화면의 정보 배치를 비교합니다.'],
    experience: ['경력 카드', '회사 정보와 담당 프로젝트의 묶음, 읽는 순서, 기술 태그를 비교합니다.'],
    toy: ['Toy Projects', 'Toy Projects 안에서 오늘한끼·NeoFall을 정리하는 방식을 비교합니다.']
};
viewButtons.forEach(button => button.addEventListener('click', () => {
    const view = button.dataset.view;
    if (!Object.hasOwn(labels, view)) return;
    viewButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    previews.forEach(image => {
        image.src = 'assets/' + image.dataset.variant + '-' + view + '.webp';
        image.alt = image.dataset.variant.toUpperCase() + ' ' + labels[view][0] + ' 화면';
    });
    document.querySelector('#view-description').textContent = labels[view][1];
}));
