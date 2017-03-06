# pw

> Dead simple password manager.

## Usage

```
pw <name>
```

Copy to clipboard the password for site `<name>`. If there's none in the
store for `<name>`, it will generate one and save it in the store.

It will prompt you for your store password (by default, `~/.pw`, can be
overridden with `PW_STORE` environment variable). If there's no store,
the password you give will become your store password for further usages.

### Edit store

```
pw -e
pw --edit
```

Open your text editor with a YAML representation of the store and update
the store after you're done editing.

### Update store password

```
pw -u
pw --update
```

Prompt you for your old store password and allow you to set a
new one.
