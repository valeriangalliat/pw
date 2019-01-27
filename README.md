# pw

> Dead simple password manager.

## Installation

```sh
npm install -g valeriangalliat/pw
```

## Usage

```sh
pw <name>
```

Copy to clipboard the password for site `<name>`. If there's none in the
store for `<name>`, it will generate one and save it in the store.

It will prompt you for your store password (by default, `~/.pw`, can be
overridden with `PW_STORE` environment variable). If there's no store,
the password you give will become your store password for further usages.

```sh
pw <name> --2fa
```

Enable 2FA mode, which will the first time prompt for your 2FA secret
(what's being the QR code usually shown when setting up 2FA, usually
there's a way to get it as plain text). Once a 2FA secret is configured
for this entry, it also generates your 2FA PIN when you request the
password.

### Edit store

```sh
pw -e
pw --edit
```

Open your text editor with a YAML representation of the store and update
the store after you're done editing.

### Update store password

```sh
pw -u
pw --update
```

Prompt you for your old store password and allow you to set a
new one.
