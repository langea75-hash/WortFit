body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f4f6fb;
  color: #222;
  text-align: center;
}
header {
  background: #4f46e5;
  color: white;
  padding: 25px 15px;
}
h1 {
  margin: 0;
  font-size: 42px;
}
header p {
  font-size: 18px;
  margin-bottom: 0;
}
main {
  max-width: 800px;
  margin: 20px auto;
  padding: 15px;
}
.card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  margin: 15px 0;
  box-shadow: 0 4px 15px rgba(0,0,0,0.12);
}
button {
  font-size: 22px;
  padding: 15px 25px;
  margin: 10px;
  border: none;
  border-radius: 14px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
}
button:hover {
  opacity: 0.9;
  transform: scale(1.02);
}
.secondary {
  background: #64748b;
}
.success {
  background: #16a34a;
}
.danger {
  background: #dc2626;
}
.hidden {
  display: none;
}
img {
  width: 100%;
  max-width: 430px;
  max-height: 320px;
  border-radius: 18px;
  margin: 20px auto;
  object-fit: contain;
  display: block;
  background: #eef2ff;
}
.timer {
  font-size: 60px;
  font-weight: bold;
  color: #dc2626;
  margin: 20px;
}
.word {
  font-size: 42px;
  font-weight: bold;
  margin: 20px;
  color: #111827;
}
input, select {
  font-size: 22px;
  padding: 14px;
  width: 90%;
  max-width: 520px;
  border-radius: 12px;
  border: 1px solid #bbb;
  margin: 12px auto;
  display: block;
  box-sizing: border-box;
}
label {
  font-size: 20px;
  font-weight: bold;
  display: block;
  margin-top: 18px;
}
.stats {
  font-size: 21px;
  line-height: 1.7;
  text-align: left;
}
footer {
  color: #777;
  margin: 30px;
}
@media (max-width: 700px) {
  h1 { font-size: 34px; }
  button { width: 100%; margin: 8px 0; }
  .timer { font-size: 48px; }
  .word { font-size: 34px; }
}
