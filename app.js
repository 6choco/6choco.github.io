mapboxgl.accessToken = "YOUR_MAPBOX_TOKEN";

const spots = [
  { name: "川越氷川神社", lng: 139.488, lat: 35.921 },
  { name: "川越城跡", lng: 139.487, lat: 35.918 },
  { name: "時の鐘", lng: 139.486, lat: 35.917 },
  { name: "川越八幡宮", lng: 139.482, lat: 35.919 },
  { name: "喜多院", lng: 139.481, lat: 35.920 },
  { name: "川越りそなテラス", lng: 139.485, lat: 35.916 }
];

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: [139.486, 35.918],
  zoom: 15
});

let currentSpotIndex = null;

const camera = document.getElementById("camera");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

spots.forEach((spot, i) => {
  const marker = new mapboxgl.Marker()
    .setLngLat([spot.lng, spot.lat])
    .addTo(map);

  marker.getElement().addEventListener("click", () => {
    currentSpotIndex = i;
    openCamera();
  });
});

async function openCamera() {
  camera.style.display = "flex";
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });
  video.srcObject = stream;
}

document.getElementById("shot").onclick = () => {
  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);

  let img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let d = img.data;

  for (let i = 0; i < d.length; i += 4) {
    let g = (d[i] + d[i+1] + d[i+2]) / 3;
    d[i] = d[i+1] = d[i+2] = g - 20;
  }

  ctx.putImageData(img, 0, 0);

  const imgTag = document.querySelectorAll(".spot img")[currentSpotIndex];
  imgTag.src = canvas.toDataURL("image/png");

  closeCamera();
  checkComplete();
};

document.getElementById("close").onclick = closeCamera;

function closeCamera() {
  camera.style.display = "none";
  video.srcObject?.getTracks().forEach(t => t.stop());
}

function checkComplete() {
  const imgs = document.querySelectorAll(".spot img");
  const completed = [...imgs].filter(img => img.src).length;

  if (completed >= 4) {
    document.getElementById("complete").style.display = "flex";
    const result = document.getElementById("result");
    result.innerHTML = "";

    imgs.forEach(img => {
      if (img.src) {
        const clone = img.cloneNode();
        result.appendChild(clone);
      }
    });
  }
}
