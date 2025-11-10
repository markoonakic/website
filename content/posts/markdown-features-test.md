+++
date = '2025-11-10'
draft = false
title = 'Markdown Features Test - Gruvbox Theme Showcase'
tags = ['test', 'markdown', 'syntax', 'demo']
preview_summary = "A comprehensive test of all markdown features with gruvbox color scheme including code blocks, headings, tables, and more."
+++

This is a comprehensive test article to showcase all markdown features with the gruvbox color scheme. Let's explore everything!

## Heading Level 2 (Blue)

This is a level 2 heading. Notice the **blue color** (#458588) from the gruvbox palette.

### Heading Level 3 (Yellow)

This is a level 3 heading with **yellow color** (#d79921). Here's some text with various formatting:

- **Bold text** appears in gruvbox yellow (#fabd2f)
- *Italic text* appears in gruvbox blue (#83a598)
- <u>Underlined text</u> appears in gruvbox purple (#b16286)
- ~~Strikethrough text~~ appears in gruvbox gray (#928374)
- `Inline code` appears in gruvbox yellow with a dark background
- <mark>Highlighted text</mark> uses gruvbox yellow background
- H<sub>2</sub>O and E=mc<sup>2</sup> show subscript and superscript in gruvbox purple

#### Heading Level 4 (Purple)

This is a level 4 heading with **purple color** (#b16286). Let's test some code blocks!

##### Heading Level 5 (Light Blue)

This is a level 5 heading with **light blue color** (#83a598).

###### Heading Level 6 (Gray)

This is a level 6 heading with **gray/muted color** (#928374).

---

## Code Blocks with Syntax Highlighting

### Python Code Block

```python
def greet(name: str) -> str:
    """Greet someone with a personalized message."""
    message = f"Hello, {name}! Welcome to the gruvbox theme."
    return message

class Person:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age
    
    def introduce(self) -> str:
        return f"I'm {self.name} and I'm {self.age} years old."

# Example usage
person = Person("Marko", 25)
print(person.introduce())
print(greet(person.name))
```

### JavaScript Code Block

```javascript
// Arrow functions and modern JavaScript
const greet = (name) => {
    return `Hello, ${name}! Welcome to the gruvbox theme.`;
};

// Async/await example
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Array methods
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);
```

### Bash/Shell Code Block

```bash
#!/bin/bash
# Script to demonstrate bash syntax highlighting

echo "Hello from bash!"
echo "Current directory: $(pwd)"
echo "User: $USER"

# Function definition
greet_user() {
    local name=$1
    echo "Welcome, $name!"
}

# Loop example
for i in {1..5}; do
    echo "Iteration $i"
done

# Conditional
if [ -f "file.txt" ]; then
    echo "File exists"
else
    echo "File does not exist"
fi
```

### HTML Code Block

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gruvbox Theme Test</title>
    <link rel="stylesheet" href="/css/syntax.css">
</head>
<body>
    <header>
        <h1>Welcome to Gruvbox</h1>
    </header>
    <main>
        <article>
            <p>This is a <strong>test</strong> of HTML syntax highlighting.</p>
        </article>
    </main>
</body>
</html>
```

### CSS Code Block

```css
/* Gruvbox color variables */
:root {
  --color-bg: #282828;
  --color-text: #ebdbb2;
  --color-purple: #b16286;
  --color-blue: #458588;
  --color-yellow: #d79921;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: 'Inter', sans-serif;
}

h2 {
  color: var(--color-blue);
}

h3 {
  color: var(--color-yellow);
}
```

### Go Code Block

```go
package main

import (
    "fmt"
    "time"
)

type Person struct {
    Name string
    Age  int
}

func (p Person) Greet() string {
    return fmt.Sprintf("Hello, I'm %s and I'm %d years old", p.Name, p.Age)
}

func main() {
    person := Person{
        Name: "Marko",
        Age:  25,
    }
    
    fmt.Println(person.Greet())
    fmt.Println("Current time:", time.Now())
}
```

---

## Lists

### Unordered Lists

- First item with **bold text**
- Second item with *italic text*
- Third item with `inline code`
- Fourth item with a [link](https://example.com)
- Nested list:
  - Nested item one
  - Nested item two
    - Deeply nested item

### Ordered Lists

1. First numbered item
2. Second numbered item
3. Third numbered item with **formatting**
4. Fourth item with *emphasis*
5. Fifth item with `code`

### Task Lists

- [x] Completed task with gruvbox styling
- [x] Another completed task
- [ ] Incomplete task
- [ ] Another incomplete task
- [x] Final completed task

---

## Tables

| Feature | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| H2 Heading | Blue | #458588 | Section headers |
| H3 Heading | Yellow | #d79921 | Subsections |
| H4 Heading | Purple | #b16286 | Sub-subsections |
| Bold Text | Yellow | #fabd2f | Emphasis |
| Italic Text | Blue | #83a598 | Emphasis |
| Inline Code | Yellow | #fabd2f | Code snippets |
| Links | Purple | #b16286 | Navigation |

---

## Blockquotes

> This is a blockquote with gruvbox blue accent border. It demonstrates how quoted text appears with the gruvbox theme.
> 
> Blockquotes can span multiple paragraphs and include **formatting** like *italic* text and `code`.

> Another blockquote example:
> 
> "The best way to predict the future is to create it." - Peter Drucker

---

## Links and References

Here are some examples of links:

- [Internal link to about page](/about)
- [External link](https://example.com) that opens in a new tab
- [Link with title](https://example.com "Example Website")
- [Link to GitHub](https://github.com) repository

---

## Horizontal Rules

Above this text is a horizontal rule. Below is another one:

---

## Definition Lists

Term 1
: Definition for term 1 with **bold** and *italic* text.

Term 2
: Definition for term 2 that can span multiple lines.
: Multiple definitions are possible.

Term 3
: Another term definition.

---

## Mixed Formatting Examples

Here's a paragraph with **bold text**, *italic text*, <u>underlined text</u>, ~~strikethrough~~, `inline code`, and a [link](https://example.com). You can also combine them: ***bold and italic***, **bold with `code`**, and *italic with <u>underline</u>*.

---

## Footnotes

Here's a sentence with a footnote reference[^1]. And another one[^2].

[^1]: This is the first footnote. It can contain **formatting** and `code`.
[^2]: This is the second footnote with a [link](https://example.com).

---

## Conclusion

This test article demonstrates all the markdown features with the gruvbox color scheme:

- ✅ All heading levels (h2-h6) with different gruvbox colors
- ✅ Code blocks with syntax highlighting in multiple languages
- ✅ Inline code with gruvbox yellow
- ✅ Text formatting: **bold** (yellow), *italic* (blue), <u>underline</u> (purple), ~~strikethrough~~ (gray)
- ✅ Lists: unordered, ordered, and task lists
- ✅ Tables with gruvbox styling
- ✅ Blockquotes with blue accent
- ✅ Links with purple color
- ✅ Horizontal rules
- ✅ Definition lists
- ✅ Footnotes
- ✅ Subscript and superscript
- ✅ Highlighted text

Everything should be beautifully styled with the gruvbox dark theme! 🎨

