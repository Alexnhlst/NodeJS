# Fullstack Node.JS [^1] :book:

## Table of contents

1. [Introduction](#introduction)

---

## Introduction

Node.js was created in reaction to slow web servers in Ruby and other dynamic languages at that time. These servers were slow because they were only capable of handling a single request at a time. Any work that involved I/O was blocking. The program would not be able to perform any work while waiting on these blocking resources. Node.js is able to hanlde many requests concurrently because it is non-blocking by default. Node.js can continue to perform while waiting on slow resources. The simplest, and most common form of asynchronous execution within Node.js is the callback. A callback is a way to specify that after X happens, do Y. Typically, "X" will be some form of slow I/O (e.g. reading a file), and "Y" will be work that incorporates the result (e.g. processing data from that file).

```javascript
window.addEventListener("resize", () =>
  console.log("window has been resized!")
);
```

To translate this back into words: "After the window is resized, print 'window has been resized!'" In other languages, we expect work to be performed in the order it is written in the file. However in JavaScript, we can make the following lines print in the reverse order from how they are written:

```javascript
const tenYears = 10 * 365 * 24 * 60 * 60 * 1000;
setTimeout(() => console.log("Hello from the past"), tenYears);
console.log("Hello from the present");
```

If we were to run the above code, you would immediately see "Hello from the present", and 10 years later, you would see "Hello from the past". Because setTimeout() is non-blocking, we don't need to wait 10 years to print "hello from the present" -- it happens immediately after.
