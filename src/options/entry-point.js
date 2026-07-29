document.getElementById("open").addEventListener("click", openOptionsPage);

async function openOptionsPage() {
  try {
    const url = browser.runtime.getURL("src/options/pages/general.html");
    await browser.tabs.create({
      url,
      active: true,
    });
  } catch (error) {
    console.error(error);
  }
}

openOptionsPage().finally();
