#!/bin/bash

# Post-installation script for OpenClaw Desktop on Linux

set -e

# Install path: electron-builder uses /opt/${sanitizedProductName}, package name is openclaw-desktop
INSTALL_PREFIX="/opt/openclaw-desktop"

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database -q /usr/share/applications || true
fi

# Update icon cache
if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache -q /usr/share/icons/hicolor || true
fi

# Create symbolic link for app binary (try common install paths)
for prefix in "$INSTALL_PREFIX" "/opt/开放龙虾宝-桌面版"; do
    if [ -x "$prefix/openclaw-desktop" ]; then
        ln -sf "$prefix/openclaw-desktop" /usr/local/bin/openclaw-desktop 2>/dev/null || true
        break
    fi
done

# Create symbolic link for openclaw CLI
for prefix in "$INSTALL_PREFIX" "/opt/开放龙虾宝-桌面版"; do
    OPENCLAW_WRAPPER="$prefix/resources/cli/openclaw"
    if [ -f "$OPENCLAW_WRAPPER" ]; then
        chmod +x "$OPENCLAW_WRAPPER" 2>/dev/null || true
        ln -sf "$OPENCLAW_WRAPPER" /usr/local/bin/openclaw 2>/dev/null || true
        break
    fi
done

# Set chrome-sandbox permissions
for prefix in "$INSTALL_PREFIX" "/opt/开放龙虾宝-桌面版"; do
    if [ -f "$prefix/chrome-sandbox" ]; then
        if ! { [[ -L /proc/self/ns/user ]] && unshare --user true; }; then
            chmod 4755 "$prefix/chrome-sandbox" 2>/dev/null || true
        else
            chmod 0755 "$prefix/chrome-sandbox" 2>/dev/null || true
        fi
        break
    fi
done

# Install AppArmor profile (Ubuntu 24.04+)
if apparmor_status --enabled > /dev/null 2>&1; then
    for prefix in "$INSTALL_PREFIX" "/opt/开放龙虾宝-桌面版"; do
        APPARMOR_PROFILE_SOURCE="$prefix/resources/apparmor-profile"
        if [ -f "$APPARMOR_PROFILE_SOURCE" ]; then
            APPARMOR_PROFILE_TARGET='/etc/apparmor.d/openclaw-desktop'
            if apparmor_parser --skip-kernel-load --debug "$APPARMOR_PROFILE_SOURCE" > /dev/null 2>&1; then
                cp -f "$APPARMOR_PROFILE_SOURCE" "$APPARMOR_PROFILE_TARGET"
                if ! { [ -x '/usr/bin/ischroot' ] && /usr/bin/ischroot; } && hash apparmor_parser 2>/dev/null; then
                    apparmor_parser --replace --write-cache --skip-read-cache "$APPARMOR_PROFILE_TARGET"
                fi
            fi
            break
        fi
    done
fi

echo "OpenClaw Desktop has been installed successfully."
