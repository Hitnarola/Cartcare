const USER_KEY = "cartshare-user";
const ACTIVE_ROOM_KEY = "cartshare-active-room";
const defaultItems = [
  {
    id: "1",
    name: "Oat milk",
    price: 4.5,
    addedBy: "Maya",
    initials: "MK",
    done: false,
  },
  {
    id: "2",
    name: "Paper towels",
    price: 12.99,
    addedBy: "Jordan",
    initials: "JD",
    done: false,
  },
  {
    id: "3",
    name: "Pasta",
    price: 2.49,
    addedBy: "You",
    initials: "YO",
    done: false,
  },
  {
    id: "4",
    name: "Sparkling water",
    price: 8.75,
    addedBy: "Priya",
    initials: "PK",
    done: true,
  },
];
const defaultActivity = [
  {
    text: "<strong>Maya</strong> added Oat milk",
    time: "just now",
    initials: "MK",
  },
  {
    text: "<strong>Jordan</strong> joined the room",
    time: "2 min ago",
    initials: "JD",
  },
  {
    text: "<strong>Priya</strong> picked up Sparkling water",
    time: "8 min ago",
    initials: "PK",
  },
];
let roomCode = localStorage.getItem(ACTIVE_ROOM_KEY) || "LOFT-42";
let currentFilter = "all";
let user = localStorage.getItem(USER_KEY) || "You";

const $ = (selector) => document.querySelector(selector);
const roomKey = () => CartShareStorage.roomKey(roomCode);
const getRoom = () => {
  const room = CartShareStorage.getRoom(roomCode);
  if (!room) return null;
  if (!room.code) {
    room.code = roomCode;
    room.members = room.members?.length
      ? room.members
      : [...new Set(room.items.map((item) => item.addedBy))];
    room.createdAt = room.createdAt || new Date().toISOString();
    CartShareStorage.saveRoom(room);
  }
  return room;
};
const saveRoom = (room) => CartShareStorage.saveRoom(room);
const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const money = (amount) => `$${amount.toFixed(2)}`;

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function render() {
  const room = getRoom() || {
    code: roomCode,
    members: [],
    items: [],
    activity: [],
  };
  const visibleItems = room.items.filter(
    (item) =>
      currentFilter === "all" ||
      (currentFilter === "mine" && item.addedBy === user) ||
      (currentFilter === "done" && item.done),
  );
  const total = room.items.reduce((sum, item) => sum + Number(item.price), 0);
  const mine = room.items.filter((item) => item.addedBy === user).length;
  const done = room.items.filter((item) => item.done).length;
  $("#roomCode").value = roomCode;
  $("#roomLabel").textContent = roomCode;
  $("#itemCount").textContent =
    `${room.items.length} item${room.items.length === 1 ? "" : "s"}`;
  $("#allCount").textContent = room.items.length;
  $("#mineCount").textContent = mine;
  $("#doneCount").textContent = done;
  $("#basketTotal").textContent = money(total);
  $("#progressAmount").textContent = money(total);
  $("#progressBar").style.width = `${Math.min((total / 75) * 100, 100)}%`;
  $("#progressMessage").textContent =
    total >= 75
      ? "Free delivery unlocked. Nice work, team."
      : `Add ${money(Math.max(75 - total, 0))} more to unlock free delivery.`;
  const memberNames = room.members?.length
    ? room.members
    : room.items.map((item) => item.addedBy);
  $("#memberCount").textContent =
    `${Math.max(new Set(memberNames).size, 1)} members shopping`;
  $("#cartList").innerHTML = visibleItems
    .map(
      (item) =>
        `<article class="cart-item"><button class="check ${item.done ? "done" : ""}" data-action="toggle" data-id="${item.id}" aria-label="Mark ${item.name} as ${item.done ? "not picked up" : "picked up"}">${item.done ? "✓" : ""}</button><div><p class="item-name ${item.done ? "done" : ""}">${item.name}</p><span class="item-meta ${item.done ? "done" : ""}">Added by ${item.addedBy} · ${item.done ? "Picked up" : "Still needed"}</span></div><span class="item-price">${money(Number(item.price))}</span><button class="remove-item" data-action="remove" data-id="${item.id}" aria-label="Remove ${item.name}">×</button></article>`,
    )
    .join("");
  $("#emptyState").hidden = visibleItems.length !== 0;
  $("#activityList").innerHTML = room.activity
    .slice(0, 4)
    .map(
      (entry) =>
        `<div class="activity"><span class="activity-avatar">${entry.initials}</span><p>${entry.text}<time>${entry.time}</time></p></div>`,
    )
    .join("");
  document
    .querySelectorAll(".filter")
    .forEach((button) =>
      button.classList.toggle(
        "active",
        button.dataset.filter === currentFilter,
      ),
    );
}

function mutateRoom(callback) {
  const room = getRoom();
  if (!room) return;
  callback(room);
  saveRoom(room);
  render();
}

$("#itemForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("#itemName").value.trim();
  const price = Number($("#itemPrice").value);
  if (!name || Number.isNaN(price) || price < 0) return;
  mutateRoom((room) => {
    room.items.unshift({
      id: crypto.randomUUID(),
      name,
      price,
      addedBy: user,
      initials: initials(user),
      done: false,
    });
    room.activity.unshift({
      text: `<strong>${user}</strong> added ${name}`,
      time: "just now",
      initials: initials(user),
    });
  });
  event.target.reset();
  showToast(`${name} added to ${roomCode}`);
});

$("#cartList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const item = getRoom().items.find((entry) => entry.id === button.dataset.id);
  if (!item) return;
  mutateRoom((room) => {
    const target = room.items.find((entry) => entry.id === item.id);
    if (button.dataset.action === "remove") {
      room.items = room.items.filter((entry) => entry.id !== item.id);
      room.activity.unshift({
        text: `<strong>${user}</strong> removed ${item.name}`,
        time: "just now",
        initials: initials(user),
      });
    } else {
      target.done = !target.done;
      room.activity.unshift({
        text: `<strong>${user}</strong> ${target.done ? "picked up" : "needs"} ${item.name}`,
        time: "just now",
        initials: initials(user),
      });
    }
  });
});

document.querySelectorAll(".filter").forEach((button) =>
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    render();
  }),
);
$("#joinRoom").addEventListener("click", () => {
  const nextRoom = $("#roomCode")
    .value.trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");
  if (!nextRoom) return;
  roomCode = nextRoom;
  const joinedRoom = CartShareStorage.joinRoom(nextRoom, user);
  if (!joinedRoom) {
    roomCode = "LOFT-42";
    showToast("Room not found. Create a new room first.");
    render();
    return;
  }
  localStorage.setItem(ACTIVE_ROOM_KEY, roomCode);
  render();
  showToast(`Joined room ${roomCode}`);
});
$("#newRoom").addEventListener("click", () => {
  const room = CartShareStorage.createRoom(user, {
    activity: [
      {
        text: `<strong>${user}</strong> created the room`,
        time: "just now",
        initials: initials(user),
      },
    ],
  });
  roomCode = room.code;
  localStorage.setItem(ACTIVE_ROOM_KEY, roomCode);
  currentFilter = "all";
  render();
  showToast(`New room ${roomCode} is ready`);
});
$("#copyRoom").addEventListener("click", async () => {
  await navigator.clipboard?.writeText(roomCode);
  showToast(`Room code ${roomCode} copied`);
});
$("#printReceipt").addEventListener("click", () => window.print());
$("#resetRoom").addEventListener("click", () => {
  localStorage.removeItem(roomKey());
  render();
  showToast("Demo room reset");
});
$("#profileButton").addEventListener("click", () => {
  const nextName = window.prompt("What should the room call you?", user);
  if (nextName?.trim()) {
    user = nextName.trim();
    localStorage.setItem(USER_KEY, user);
    $("#profileButton").textContent = initials(user);
    render();
  }
});
window.addEventListener("storage", (event) => {
  if (event.key === roomKey()) {
    render();
    showToast("Room updated in another tab");
  }
});

$("#profileButton").textContent = initials(user);
if (!CartShareStorage.getRoom(roomCode)) {
  saveRoom({
    code: roomCode,
    members: [user, "Maya", "Jordan", "Priya"],
    items: defaultItems,
    activity: defaultActivity,
    createdAt: new Date().toISOString(),
  });
}
render();
