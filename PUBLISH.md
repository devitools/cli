# How to publish

## 1. commit all changes
```
git add <changes>
git commit -m "(<type>) <message>"
```

## 2. publish
```
yarn publish
```

## 3. move the changes to main
```
git checkout main
git rebase nightly
git checkout nightly
```

## 4. push everything (with tags)
```
git push --all
git push --tags
```
