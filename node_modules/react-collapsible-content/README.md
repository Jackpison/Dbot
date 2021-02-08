# react-collapsible-content

> A React Component to handle dynamic collapsible content

[![NPM](https://img.shields.io/npm/v/react-collapsible-content.svg)](https://www.npmjs.com/package/react-collapsible-content) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-collapsible-content
```

```bash
yarn add react-collapsible-content
```

## Basic Usage

```jsx
import React, { useState } from 'react';
import CollapsibleContent from 'react-collapsible-content';

function Toggle() {
    const [expanded, setExpanded] = useState(false);
    return (
        <div>
            <button onClick={() => setExpanded((prev) => !prev)}>TOGGLE</button>
            <CollapsibleContent expanded={expanded}>
                <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s when an unknown
                    printer took a galley of type and scrambled it to make a
                    type specimen book.
                </p>
            </CollapsibleContent>
        </div>
    );
}
```

## Documentation.

Read [documentation](https://llorentegerman.github.io/react-collapsible-content/).

## License

MIT © [llorentegerman](https://github.com/llorentegerman)

## Author

![me](https://avatars1.githubusercontent.com/u/21162888?s=100&v=4)

[Germán Llorente](https://github.com/llorentegerman)
