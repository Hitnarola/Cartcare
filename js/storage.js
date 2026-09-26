const CartShareStorage = (() => {
  const ROOM_PREFIX = "cartshare-room-";

  function roomKey(code) {
    return `${ROOM_PREFIX}${code.trim().toUpperCase()}`;
  }

  function generateRoomCode() {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let index = 0; index < 6; index += 1) {
      code += characters[Math.floor(Math.random() * characters.length)];
    }
    return code;
  }

  function getRoom(code) {
    const rawRoom = localStorage.getItem(roomKey(code));
    return rawRoom ? JSON.parse(rawRoom) : null;
  }

  function saveRoom(room) {
    localStorage.setItem(roomKey(room.code), JSON.stringify(room));
    return room;
  }

  function createRoom(userName, initialData = {}) {
    let code;
    do {
      code = generateRoomCode();
    } while (getRoom(code));

    return saveRoom({
      code,
      members: [userName],
      items: initialData.items || [],
      activity: initialData.activity || [],
      createdAt: new Date().toISOString(),
    });
  }

  function joinRoom(code, userName) {
    const normalizedCode = code.trim().toUpperCase();
    const room = getRoom(normalizedCode);
    if (!room) return null;

    room.members = room.members || [];
    room.activity = room.activity || [];
    if (!room.members.includes(userName)) {
      room.members.push(userName);
      room.activity.unshift({
        text: `<strong>${userName}</strong> joined the room`,
        time: "just now",
        initials: userName
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      });
    }

    return saveRoom(room);
  }

  function updateRoom(code, changes) {
    const room = getRoom(code);
    if (!room) return null;
    return saveRoom({ ...room, ...changes });
  }

  return { roomKey, getRoom, saveRoom, createRoom, joinRoom, updateRoom };
})();
