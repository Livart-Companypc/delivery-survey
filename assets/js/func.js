(function () {
  "use strict";

  var TEST_BYPASS = true;

  function isLoggedIn() {
    return TEST_BYPASS || window.__TEST_BYPASS__ !== false;
  }

  function guardAction(callback) {
    if (!isLoggedIn()) {
      alert("로그인이 필요합니다.");
      return;
    }
    callback();
  }

  function initAddressEditButton() {
    var survey2 = document.querySelector(".survey2");
    if (!survey2) return;

    var editButton = survey2.querySelector(".btn-edit");
    if (!editButton) return;

    editButton.addEventListener("click", function () {
      guardAction(function () {
        alert("자사몰 주문결제와 동일하게 카카오 우편번호 서비스 작업해주세요");
      });
    });
  }

  function createTooltip(icon, message) {
    var wrap = document.createElement("span");
    wrap.className = "info-tooltip";

    icon.parentNode.insertBefore(wrap, icon);
    wrap.appendChild(icon);

    var tooltip = document.createElement("span");
    tooltip.className = "info-desc";
    tooltip.setAttribute("role", "tooltip");
    tooltip.textContent = message;
    wrap.appendChild(tooltip);

    icon.setAttribute("tabindex", "0");
    icon.setAttribute("aria-describedby", tooltip.id || undefined);

    var pinned = false;

    function show() {
      wrap.classList.add("info-tooltip--active");
    }

    function hide() {
      pinned = false;
      wrap.classList.remove("info-tooltip--active");
    }

    wrap.addEventListener("mouseenter", show);
    wrap.addEventListener("mouseleave", function () {
      if (!pinned) {
        wrap.classList.remove("info-tooltip--active");
      }
    });

    icon.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      guardAction(function () {
        pinned = !pinned;
        wrap.classList.toggle("info-tooltip--active", pinned);
      });
    });

    icon.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        guardAction(function () {
          pinned = !pinned;
          wrap.classList.toggle("info-tooltip--active", pinned);
        });
      }
      if (event.key === "Escape") {
        hide();
      }
    });

    document.addEventListener("click", function (event) {
      if (!wrap.contains(event.target)) {
        hide();
      }
    });
  }

  function initTooltips() {
    var tooltipConfigs = [
      {
        selector: ".survey2 h2.section-title--with-icon .icon-info",
        message: "도서산간 지역은 배송시간이 추가 협의 될 수 있습니다.",
      },
      {
        selector: ".survey2 .field__label--with-icon .icon-info",
        message:
          "오전: 8~12시\n오후A: 12~16시\n오후B: 16~19시\n퇴근배송: 19시 이후",
      },
      {
        selector: ".survey3 h2.section-title--with-icon .icon-info",
        message: "상품 배송 후 설치될 공간을 미리 확보해 주셔야 합니다.",
      },
    ];

    tooltipConfigs.forEach(function (config) {
      var icon = document.querySelector(config.selector);
      if (icon) {
        createTooltip(icon, config.message);
      }
    });
  }

  function initSelectOptions() {
    var entryEquipment = document.getElementById("entry-equipment");
    if (entryEquipment) {
      entryEquipment.innerHTML = [
        { value: "elevator", label: "엘리베이터" },
        { value: "stairs", label: "계단" },
        { value: "ladder-truck", label: "사다리차" },
      ]
        .map(function (option) {
          return (
            '<option value="' +
            option.value +
            '">' +
            option.label +
            "</option>"
          );
        })
        .join("");
      entryEquipment.value = "elevator";
    }

    var extraWork = document.getElementById("extra-work");
    if (extraWork) {
      extraWork.innerHTML = [
        { value: "none", label: "없음" },
        { value: "furniture-removal", label: "폐가구내림" },
        { value: "room-move", label: "방간이동" },
      ]
        .map(function (option) {
          return (
            '<option value="' +
            option.value +
            '">' +
            option.label +
            "</option>"
          );
        })
        .join("");
      extraWork.value = "none";
    }
  }

  function initMemoTextarea() {
    var memo = document.querySelector(".memo-textarea");
    if (!memo) return;

    memo.setAttribute("maxlength", "50");

    memo.addEventListener("input", function () {
      if (memo.value.length > 50) {
        memo.value = memo.value.slice(0, 50);
      }
    });
  }

  function init() {
    initAddressEditButton();
    initTooltips();
    initSelectOptions();
    initMemoTextarea();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
