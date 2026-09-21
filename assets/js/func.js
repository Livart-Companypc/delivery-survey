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
    icon.setAttribute("role", "button");
    icon.setAttribute("aria-expanded", "false");

    var pinned = false;
    var hovering = false;
    var dismissUntilLeave = false;

    function syncVisibility() {
      var visible = pinned || (hovering && !dismissUntilLeave);
      wrap.classList.toggle("info-tooltip--active", visible);
      icon.setAttribute("aria-expanded", visible ? "true" : "false");
    }

    function hide() {
      pinned = false;
      hovering = false;
      dismissUntilLeave = false;
      syncVisibility();
    }

    wrap.addEventListener("mouseenter", function () {
      hovering = true;
      syncVisibility();
    });

    wrap.addEventListener("mouseleave", function () {
      hovering = false;
      dismissUntilLeave = false;
      syncVisibility();
    });

    icon.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      guardAction(function () {
        if (pinned) {
          pinned = false;
          dismissUntilLeave = true;
        } else {
          pinned = true;
          dismissUntilLeave = false;
        }
        syncVisibility();
      });
    });

    icon.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        guardAction(function () {
          if (pinned) {
            pinned = false;
            dismissUntilLeave = true;
          } else {
            pinned = true;
            dismissUntilLeave = false;
          }
          syncVisibility();
        });
      }
      if (event.key === "Escape") {
        hide();
      }
    });

    document.addEventListener("click", function (event) {
      if (!wrap.contains(event.target)) {
        pinned = false;
        syncVisibility();
      }
    });
  }

  function initTooltips() {
    var tooltipConfigs = [
      {
        selector: ".survey2 h2.section-title--with-icon .icon-info",
        message:
          "도서산간 지역은 배송시간이 추가 협의 될 수 있습니다.\n당사 사정으로 인해 희망배송일이 지연될 수 있습니다.\n배송지와 희망 배송일은 1개만 선택하실 수 있습니다.",
      },
      {
        selector: ".survey2 .field__label--with-icon .icon-info",
        message:
          "오전: 8~12시\n오후A: 12~16시\n오후B: 16~19시\n퇴근배송: 19시 이후",
      },
      {
        selector: ".survey3 h2.section-title--with-icon .icon-info",
        message:
          "상품 배송 후 설치될 공간을 미리 확보해 주셔야 합니다.\n(기존 가구 처분이 별도로 필요할 경우 폐가구 내림 서비스 신청)\n3층 이상의 건물, 계단 폭 2m 미만, 엘리베이터가 없는 경우 등 주거 환경 따라 이동 불가능할 경우 진입 장비 비용이 추가 발생될 수 있습니다.\n(배송 후 현지에서 사다리차 거부 시 반품비가 발생될 수 있습니다.)",
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
            '<option value="' + option.value + '">' + option.label + "</option>"
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
            '<option value="' + option.value + '">' + option.label + "</option>"
          );
        })
        .join("");
      extraWork.value = "none";
    }
  }

  function getCharByteLength(char) {
    return char.charCodeAt(0) > 127 ? 2 : 1;
  }

  function truncateByByteLength(str, maxBytes) {
    var bytes = 0;
    var result = "";

    for (var i = 0; i < str.length; i++) {
      var char = str.charAt(i);
      var charBytes = getCharByteLength(char);

      if (bytes + charBytes > maxBytes) {
        break;
      }

      bytes += charBytes;
      result += char;
    }

    return result;
  }

  function initMemoTextarea() {
    var memo = document.querySelector(".memo-textarea");
    if (!memo) return;

    var maxBytes = 100;

    memo.setAttribute("maxlength", String(maxBytes));

    memo.addEventListener("input", function () {
      var truncated = truncateByByteLength(memo.value, maxBytes);
      if (memo.value !== truncated) {
        memo.value = truncated;
      }
    });
  }

  function initDeliveryDateInput() {
    var dateWrap = document.querySelector(".date-wrap");
    var dateInput = document.querySelector(".field__value--date");
    if (!dateWrap || !dateInput) return;

    function activate() {
      dateWrap.classList.add("date-wrap--active");
    }

    function deactivate() {
      dateWrap.classList.remove("date-wrap--active");
    }

    dateInput.addEventListener("focus", activate);
    dateInput.addEventListener("click", activate);
    dateInput.addEventListener("cancel", deactivate);

    document.addEventListener("focusin", function (event) {
      if (dateWrap.contains(event.target)) {
        activate();
        return;
      }

      deactivate();
    });
  }

  function hideAllPopups() {
    var popups = document.querySelectorAll(".popup");
    popups.forEach(function (popup) {
      popup.classList.remove("is-open");
      popup.setAttribute("aria-hidden", "true");
    });
  }

  function showPopup(popup) {
    if (!popup) return;
    popup.classList.add("is-open");
    popup.setAttribute("aria-hidden", "false");
  }

  function initPopups() {
    hideAllPopups();

    var popupConfirm = document.getElementById("popup-confirm");
    var popupConfirmed = document.getElementById("popup-confirmed");
    var popupDayofweek = document.getElementById("popup-dayofweek");
    var popupExtraWork = document.getElementById("popup-extra-work");

    var btnConfirm = document.querySelector(".page .btn-confirm");
    if (btnConfirm) {
      btnConfirm.addEventListener("click", function () {
        guardAction(function () {
          hideAllPopups();
          showPopup(popupConfirm);
        });
      });
    }

    if (popupConfirm) {
      var confirmSaveBtn = popupConfirm.querySelector(".popup__btn--save");
      if (confirmSaveBtn) {
        confirmSaveBtn.addEventListener("click", function () {
          guardAction(function () {
            hideAllPopups();
            showPopup(popupConfirmed);
          });
        });
      }

      var confirmCancelBtn = popupConfirm.querySelector(".popup__btn--cancel");
      if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener("click", function () {
          guardAction(function () {
            hideAllPopups();
          });
        });
      }
    }

    if (popupConfirmed) {
      var confirmedSaveBtn = popupConfirmed.querySelector(".popup__btn--save");
      if (confirmedSaveBtn) {
        confirmedSaveBtn.addEventListener("click", function () {
          guardAction(function () {
            hideAllPopups();
          });
        });
      }
    }

    var infoareaIcon = document.querySelector(".infoarea img[src*='i.svg']");
    if (infoareaIcon) {
      infoareaIcon.setAttribute("role", "button");
      infoareaIcon.setAttribute("tabindex", "0");
      infoareaIcon.addEventListener("click", function (event) {
        event.preventDefault();
        guardAction(function () {
          showPopup(popupDayofweek);
        });
      });
      infoareaIcon.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          guardAction(function () {
            showPopup(popupDayofweek);
          });
        }
      });
    }

    document.querySelectorAll(".popup .popup__close").forEach(function (button) {
      button.addEventListener("click", function () {
        guardAction(function () {
          hideAllPopups();
        });
      });
    });

    var extraWork = document.getElementById("extra-work");
    if (extraWork && popupExtraWork) {
      extraWork.addEventListener("change", function () {
        guardAction(function () {
          if (extraWork.value === "furniture-removal") {
            showPopup(popupExtraWork);
          }
        });
      });

      popupExtraWork
        .querySelectorAll(".popup__btn--cancel, .popup__btn--save")
        .forEach(function (button) {
          button.addEventListener("click", function () {
            guardAction(function () {
              hideAllPopups();
            });
          });
        });
    }

    if (popupDayofweek) {
      popupDayofweek
        .querySelectorAll(".popup__btn--cancel, .popup__btn--save")
        .forEach(function (button) {
          button.addEventListener("click", function () {
            guardAction(function () {
              hideAllPopups();
            });
          });
        });
    }
  }

  function initQtyControls() {
    document.querySelectorAll(".qty-control").forEach(function (control) {
      var valueEl = control.querySelector(".qty-control__value");
      var buttons = control.querySelectorAll(".qty-control__btn");
      if (!valueEl || buttons.length < 2) return;

      var decreaseBtn = buttons[0];
      var increaseBtn = buttons[1];

      function getValue() {
        var parsed = parseInt(valueEl.textContent, 10);
        return isNaN(parsed) ? 0 : parsed;
      }

      function setValue(next) {
        valueEl.textContent = String(Math.max(0, next));
      }

      decreaseBtn.addEventListener("click", function () {
        guardAction(function () {
          setValue(getValue() - 1);
        });
      });

      increaseBtn.addEventListener("click", function () {
        guardAction(function () {
          setValue(getValue() + 1);
        });
      });
    });
  }

  function init() {
    initAddressEditButton();
    initTooltips();
    initSelectOptions();
    initMemoTextarea();
    initDeliveryDateInput();
    initPopups();
    initQtyControls();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
