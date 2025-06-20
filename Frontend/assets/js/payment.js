function formatCurrency(num) {
  return Number(num).toLocaleString("vi-VN") + " VNĐ";
}

function updateTotals() {
  let subtotal = 0;
  document.querySelectorAll(".product-item").forEach(item => {
    const price = parseFloat(item.dataset.price);
    const quantity = parseInt(item.querySelector(".quantity-input").value);
    const itemTotal = price * quantity;
    item.querySelector(".item-total").textContent = formatCurrency(itemTotal);
    subtotal += itemTotal;
  });

  const tax = Math.round(subtotal * 0.135);
  const total = subtotal + tax;

  document.getElementById("subtotal").textContent = formatCurrency(subtotal);
  document.getElementById("tax").textContent = formatCurrency(tax);
  document.getElementById("total").textContent = formatCurrency(total);
}

// Xử lý sự kiện tăng số lượng
document.querySelectorAll(".increase").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = btn.parentElement.querySelector(".quantity-input");
    input.value = parseInt(input.value) + 1;
    updateTotals();
  });
});

// Xử lý sự kiện giảm số lượng
document.querySelectorAll(".decrease").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = btn.parentElement.querySelector(".quantity-input");
    const newVal = Math.max(1, parseInt(input.value) - 1);
    input.value = newVal;
    updateTotals();
  });
});

// Xử lý sự kiện nhập số lượng bằng tay
document.querySelectorAll(".quantity-input").forEach(input => {
  input.addEventListener("input", () => {
    if (parseInt(input.value) < 1 || isNaN(parseInt(input.value))) {
      input.value = 1;
    }
    updateTotals();
  });
});

// Xử lý xóa sản phẩm
document.querySelectorAll(".remove-item").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.closest(".product-item").remove();
    updateTotals();
  });
});

// Cập nhật tổng khi trang vừa tải
updateTotals();

// Hiển thị popup khi nhấn "Tiếp tục"
document.getElementById("confirm-payment-btn").addEventListener("click", function () {
  const popup = document.getElementById("success-popup");
  popup.classList.remove("hidden");
  setTimeout(() => popup.classList.add("show"), 10);
});

document.addEventListener("DOMContentLoaded", () => {
  const userInfo = JSON.parse(localStorage.getItem("shippingInfo"));
  const addressList = JSON.parse(localStorage.getItem("deliveryAddresses")) || [];

  if (userInfo) {
    document.getElementById("display-name").textContent = userInfo.name || "";
    document.getElementById("display-phone").textContent = userInfo.phone || "";
    document.getElementById("display-email").textContent = userInfo.email || "";
  }

  const index = parseInt(userInfo?.addressIndex, 10);
  if (!isNaN(index) && addressList[index]) {
    const addr = addressList[index];
    document.getElementById("display-address").textContent =
      `${addr.detail}, ${addr.ward}, ${addr.district}, ${addr.province}`;
  }
});
