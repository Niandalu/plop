const { renderScript, renderPlop } = require("./render");
const { resolve } = require("path");
const { waitFor } = require("cli-testing-library");
const fs = require("fs");
const { getFileHelper } = require("./file-helper");
const { getFilePath } = getFileHelper();

const renderWrapper = (...props) => {
  return renderScript(
    resolve(__dirname, "./examples/wrap-plop/index.js"),
    ...props
  );
};

test("wrapper should show version on v flag", async () => {
  const { findByText } = await renderWrapper(["-v"]);

  expect(await findByText(/^[\w\.-]+$/)).toBeTruthy();
});

test("wrapper should prompts", async () => {
  const { findByText, fireEvent } = await renderWrapper([""], {
    cwd: resolve(__dirname, "./examples/wrap-plop"),
  });

  expect(await findByText("What is your name?")).toBeTruthy();
  fireEvent.sigterm();
});

test("wrapper should bypass prompts with index", async () => {
  const { findByText, queryByText, fireEvent } = await renderWrapper(
    ["Corbin"],
    {
      cwd: resolve(__dirname, "./examples/wrap-plop"),
    }
  );

  expect(await queryByText("What is your name?")).toBeFalsy();
  expect(await findByText("What pizza toppings do you like?")).toBeTruthy();
  fireEvent.sigterm();
});

test("wrapper should bypass prompts with name", async () => {
  const { findByText, queryByText, fireEvent } = await renderWrapper(
    ["--name", "Corbin"],
    {
      cwd: resolve(__dirname, "./examples/wrap-plop"),
    }
  );

  expect(await queryByText("What is your name?")).toBeFalsy();
  expect(await findByText("What pizza toppings do you like?")).toBeTruthy();
  fireEvent.sigterm();
});

test("can run actions (add)", async () => {
  const expectedFilePath = await getFilePath(
    "./examples/wrap-plop/output/added.txt"
  );

  const { fireEvent } = await renderWrapper(["Test", "Cheese"], {
    cwd: resolve(__dirname, "./examples/wrap-plop"),
  });

  await waitFor(() => fs.promises.stat(expectedFilePath));

  const data = fs.readFileSync(expectedFilePath, "utf8");

  expect(data).toMatch(/Hello/);

  fireEvent.sigterm();
});
