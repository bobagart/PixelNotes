# Contributing to PixelNotes

Thanks for helping. Small, focused pull requests are easiest to review.

## Before you start

- Open an issue first for anything large, so we can agree on the direction.
- The app is one `index.html` with no build step. Keep it that way unless there is a strong reason.

## Licensing of contributions

PixelNotes is licensed under the [Apache License 2.0](LICENSE). By submitting a contribution you agree it is licensed under the same terms (section 5 of the license), and you confirm you have the right to submit it.

Sign off every commit to confirm this (the [Developer Certificate of Origin](https://developercertificate.org/)):

```bash
git commit -s -m "Describe your change"
```

This adds a `Signed-off-by: Your Name <you@example.com>` line. You keep the copyright on your own contributions. The original author, Clark Adriane Ratilla, remains credited in `LICENSE` and `NOTICE`.

## Pull requests

- Explain what changed and why.
- Test in a browser: create a board, try the feature, reload, and check nothing else broke.
- If you change the logo, edit `tools/make-icons.js` and run `node tools/make-icons.js`.
- All changes are reviewed by the code owner before merging.
