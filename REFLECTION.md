# Week 1 reflection

Answer each question in 1–3 sentences, in your own words.

1. What is the difference between building a UI imperatively (plain DOM code) and declaratively (React)?

Imperatively, I write every step myself, like creating elements, setting their text and adding them to the page in order. Declaratively, I just describe what the UI should look like for the current data, and React works out how to update the DOM to match.

2. Why must a component name start with a capital letter?

JSX treats lowercase tags like `<header>` as normal HTML elements and capitalised tags like `<Header />` as React components. If the name started with a lowercase letter, React would try to render an HTML tag with that name instead of calling my function.

3. What does a fragment <>...</> do, and why not just use a <div>?

A fragment lets a component return several elements wrapped as one, without adding an extra element to the page. A `<div>` would add an unnecessary node to the DOM that could break the layout or styling, for example between the header, main and footer.

4. Name one benefit of splitting the UI into small components.

Each component, like VendorCard or MenuItemCard, can be written, tested and fixed on its own and then reused many times. This keeps the code easier to read and means a change in one place updates everywhere the component is used.
