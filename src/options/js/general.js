import { showPopup } from "../../utils/show-popup.js";

document.getElementById("test").addEventListener("click", () => {
	showPopup({
		text: "Test Popup",
		position: {
			centerHorizontally: true,
		},
	});
});
