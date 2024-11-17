let menuItems = JSON.parse(localStorage.getItem('menuItems')) || []; // 로컬 스토리지에서 메뉴 불러오기
let cart = []; // 장바구니
let salesRecords = JSON.parse(localStorage.getItem('salesRecords')) || []; // 판매 기록

// 카메라 스트림을 시작하는 함수
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            const videoElement = document.getElementById('video');
            videoElement.srcObject = stream;
        })
        .catch(function (error) {
            console.error('카메라 접근 오류:', error);
            alert('카메라에 접근할 수 없습니다.');
        });
}

// 페이지 로드 시 카메라 시작
window.onload = function () {
    startCamera();
    updateMenu();
    updateDateTime();
    setInterval(updateDateTime, 1000); // 1초마다 시간 갱신
};

// 시간과 날짜 업데이트 함수
function updateDateTime() {
    const currentTimeElement = document.getElementById('current-time');
    const currentDateElement = document.getElementById('current-date');

    const now = new Date();
    const time = now.toLocaleTimeString();
    const date = now.toLocaleDateString();

    currentTimeElement.textContent = `현재 시간: ${time}`;
    currentDateElement.textContent = `오늘 날짜: ${date}`;

    const currentTimeElement2 = document.getElementById('current-time2');
    const currentDateElement2 = document.getElementById('current-date2');


    currentTimeElement2.textContent = `현재 시간: ${time}`;
    currentDateElement2.textContent = `오늘 날짜: ${date}`;
}

// 메뉴 추가 모달 열기
function openMenuModal() {
    const modal = document.getElementById("menuModal");
    modal.style.display = "block";
}

// 메뉴 추가 모달 닫기
function closeMenuModal() {
    const modal = document.getElementById("menuModal");
    modal.style.display = "none";
}

// 메뉴 추가 함수
function addMenuItem() {
    const name = document.getElementById('menu-name').value;
    const price = parseInt(document.getElementById('menu-price').value);

    if (name && price > 0) {
        menuItems.push({ name, price });  // 메뉴 항목 배열에 추가
        saveMenuItems();                  // 로컬 스토리지에 저장
        updateMenu();                     // 화면에 메뉴 업데이트
        closeMenuModal();                 // 모달 닫기
    } else {
        alert('아이템 이름과 가격을 정확히 입력해주세요.');
    }
}

// 메뉴를 로컬 스토리지에 저장하는 함수
function saveMenuItems() {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
}

// 메뉴 업데이트 함수
function updateMenu() {
    const menuContainer = document.getElementById('menu-items');
    menuContainer.innerHTML = ''; // 기존 메뉴 항목 초기화

    menuItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('menu-item');
        div.innerHTML = `
            <span>${item.name} - ${item.price}원</span>
            <button onclick="addToCart(${index})">장바구니 담기</button>
            <button onclick="deleteMenuItem(${index})">삭제</button>
        `;
        menuContainer.appendChild(div);
    });
}

// 메뉴 삭제 함수
function deleteMenuItem(index) {
    menuItems.splice(index, 1);  // 배열에서 항목 삭제
    saveMenuItems();             // 로컬 스토리지 업데이트
    updateMenu();                // 화면 업데이트
}

// 장바구니에 아이템 추가 함수
function addToCart(index) {
    const item = menuItems[index];

   // 장바구니에 이미 있는 아이템인지 확인
    const existingItem = cart.find(cartItem => cartItem.name === item.name);
    
    if (existingItem) {
        // 이미 있으면 수량만 증가시킴
        existingItem.quantity += 1;
    } else {
        // 새로운 아이템은 quantity를 1로 초기화
        item.quantity = 1;
        cart.push(item);
    }

    updateCart();
}

// 장바구니 업데이트 함수
function updateCart() {
    const cartList = document.getElementById('cart-list');
    cartList.innerHTML = ''; // 기존 장바구니 목록 초기화

    let total = 0;
    
    // 장바구니 항목 출력
    cart.forEach((item) => {
        const li = document.createElement('li');
        li.innerHTML = `${item.name} - ${item.price}원 x ${item.quantity} 
            <button onclick="removeFromCart('${item.name}')">삭제</button>
            <button onclick="updateQuantityInCart('${item.name}', 1)">수량 증가</button>
            <button onclick="updateQuantityInCart('${item.name}', -1)">수량 감소</button>`;
        cartList.appendChild(li);
        total += item.price * item.quantity;
    });

    const totalElement = document.getElementById('cart-total');
    totalElement.textContent = `총 금액: ${total}원`;
}
// 장바구니 항목 삭제 함수
function removeFromCart(itemName) {
    cart = cart.filter(item => item.name !== itemName);  // 해당 항목 삭제
    updateCart();  // 장바구니 업데이트
}

// 장바구니에서 수량 변경 함수
function updateQuantityInCart(itemName, delta) {
    const itemIndex = cart.findIndex(item => item.name === itemName); // 이름으로 해당 항목 찾기

    if (itemIndex !== -1) {
        // 수량이 없으면 1로 초기화
        if (!cart[itemIndex].quantity) {
            cart[itemIndex].quantity = 1;
        }

        // 수량 변경 (delta는 증가 또는 감소 값)
        cart[itemIndex].quantity += delta;

        // 수량이 0 이하가 되면 항목을 장바구니에서 삭제
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1); // 항목 삭제
        }
    }

    updateCart(); // 장바구니 업데이트
}
// 결제 화면 열기
function checkout() {
    document.getElementById('checkout').style.display = 'block';
}

// 결제 처리 함수 (현금 결제)
function processPayment() {
    const cashIn = parseInt(document.getElementById('cash-in').value);
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); // 수량 반영하여 합산
    if (cashIn >= totalAmount) {
        const change = cashIn - totalAmount;
        const receiptDetails = `
            <p>총 금액: ${totalAmount}원</p>
            <p>투입 금액: ${cashIn}원</p>
            <p>잔돈: ${change}원</p>
        `;
        document.getElementById('receipt-details').innerHTML = receiptDetails;
        document.getElementById('receipt').style.display = 'block';
        
        // 전자 영수증 10초 뒤 자동으로 사라짐
        setTimeout(() => {
            document.getElementById('receipt').style.display = 'none';
            document.getElementById('main-screen').style.display = 'none';  // 기본 화면 숨기기
            document.getElementById('first-screen').style.display = 'block';  // 첫 화면 보이기
        }, 10000);  // 10초 후에 사라짐

        // 판매 기록 저장
        saveSaleRecord(totalAmount, cashIn, change);

        // 결제 후 장바구니 비우기
        cart = [];
        updateCart();
        document.getElementById('checkout').style.display = 'none';
    } else {
        alert('투입 금액이 부족합니다.');
    }
}

// 판매 기록 저장 함수
function saveSaleRecord(totalAmount, cashIn, change) {
    const date = new Date().toLocaleDateString();
    const record = {
        date,
        items: [...cart],
        totalAmount,
        cashIn,
        change
    };
    salesRecords.push(record);
    localStorage.setItem('salesRecords', JSON.stringify(salesRecords));
}
// 판매 기록 보기 모달 열기
function openSalesModal() {
    const modal = document.getElementById("salesModal");
    modal.style.display = "block"; // 모달 보이기
    updateSalesRecords();         // 판매 기록 업데이트
}

// 판매 기록 모달 닫기
function closeSalesModal() {
    const modal = document.getElementById("salesModal");
    modal.style.display = "none";  // 모달 숨기기
}
// 판매 기록 업데이트 함수
function updateSalesRecords() {
    const salesList = document.getElementById('sales-history');
    salesList.innerHTML = ''; // 기존 판매 기록 초기화

    if (salesRecords.length === 0) {
        salesList.innerHTML = '<li>판매 기록이 없습니다.</li>';
    } else {
        salesRecords.forEach((record, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${record.date} - ${record.totalAmount}원</span>
                <button onclick="deleteSaleRecord(${index})">삭제</button>
            `;
            salesList.appendChild(li);
        });
    }
}

// 판매 기록 보기
function viewSalesRecords() {
    const salesList = document.getElementById('sales-history');
    const salesListDiv = document.getElementById('sales-list');
    salesList.innerHTML = '';

    salesRecords.forEach((record, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${record.date} - ${record.totalAmount}원</span>
            <button onclick="deleteSaleRecord(${index})">삭제</button>
        `;
        salesList.appendChild(li);
    });

    salesListDiv.style.display = 'block';
}

// 판매 기록 삭제 함수
function deleteSaleRecord(index) {
    salesRecords.splice(index, 1);
    localStorage.setItem('salesRecords', JSON.stringify(salesRecords)); // 로컬 스토리지 업데이트
    viewSalesRecords(); // 삭제 후 판매 기록 다시 보기
}
// 시작 화면으로 돌아가기
function clearcart() {
    // 장바구니 비우기
    cart = [];
    updateCart();  // 장바구니 업데이트
}
