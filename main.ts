import { App, Plugin, getIconIds, setIcon, PluginSettingTab, Setting, IconName, SuggestModal, FileSystemAdapter, TFolder} from "obsidian";

interface VaultNamePluginSettings {
	sticky: boolean;
	alignment: string;
	padding: string;
	background: string;
	border: string;
	borderRadius: string;
	showIcon: boolean;
	icon: string;
	iconSize: string;
	iconColor: string;
	iconRotate: string;
	titleFontSize: string;
	titleColor: string;
	titleFont: string;
	titleLetterSpacing: string;
	titleWeight: string;
}

const DEFAULT_SETTINGS: VaultNamePluginSettings = {
	sticky: false,
	alignment: 'flex-start',
	padding: 'var(--size-2-2)',
	background: 'var(--background-secondary)',
	border: 'none',
	borderRadius: 'var(--radius-m)',
	showIcon: false,
	icon: 'vault',
	iconSize: 'var(--icon-m)',
	iconColor: 'var(--nav-item-color)',
	iconRotate: '0deg',
	titleFontSize: "var(--font-ui-medium)",
	titleColor: "var(--nav-item-color)",
	titleFont: "var(--font-interface)",
	titleLetterSpacing: "normal",
	titleWeight: "var(--font-normal)",
}

export default class VaultNamePlugin extends Plugin {
	settings: VaultNamePluginSettings;

	async onload() {
		// settings tab
		await this.loadSettings();
		this.addSettingTab(new VaultNameSettingTab(this.app, this));
		// update on file/folder create
		this.registerEvent(
			this.app.vault.on('create', () => {
				this.deactivateVaultName();
				this.activateVaultName();
			})
		);
		// update on file/folder delete
		this.registerEvent(
			this.app.vault.on('delete', () => {
				this.deactivateVaultName();
				this.activateVaultName();
			})
		);
		// activate vault name
		this.activateVaultName();
		console.log('Vault name plugin loaded');
	}

	onunload() {
		this.deactivateVaultName();
		console.log('Vault name plugin unloaded');
	}

	activateVaultName() {
		const navContainer = window.activeDocument.querySelector('.nav-files-container');
		// wrapper
		const vaultNameWrapper = createDiv('nav-vault-name', (el) => {
			// Vault stats aria-label tooltip
			let allLoadedFile = this.app.vault.getAllLoadedFiles();
			let folderCount: number = 0;
			allLoadedFile.forEach((f) => {
				if (f instanceof TFolder) {
					folderCount++;
				}
			});
			// is there more than one (1) folder?
			let plural: string = '';
			if ((folderCount-1) > 1) {
				plural = 's';
			}
			let ariaLabel: string = (this.app.vault.adapter as FileSystemAdapter).getBasePath() + "\n\n" + this.app.vault.getFiles().length.toLocaleString() + " files, " + (folderCount-1).toLocaleString() + " folder" + plural;
			el.setAttribute('aria-label', ariaLabel);
			el.setAttribute('data-tooltip-position', 'right');
			let wrapperStyles: string = '';
			// alignment
			if (this.settings.alignment !== '') {
				wrapperStyles += '--vault-name-alignment: ' + this.settings.alignment + '; ';
			} else {
				wrapperStyles += '--vault-name-alignment: ' + DEFAULT_SETTINGS.alignment + '; ';
			}
			// padding
			if (this.settings.padding !== '') {
				wrapperStyles += ' --vault-name-padding: ' + this.settings.padding + '; '
			} else {
				wrapperStyles += ' --vault-name-padding: ' + DEFAULT_SETTINGS.padding + '; ';
			}
			// position: sticky
			if (this.settings.sticky) {
				wrapperStyles += '--vault-name-position: sticky; --vault-name-top: 0; --vault-name-z-index: 9; ';
			} else {
				wrapperStyles += '--vault-name-position: relative; --vault-name-top: auto; --vault-name-z-index: inherit; ';
			}
			// border
			if (this.settings.border !== '') {
				wrapperStyles += '--vault-name-border: ' + this.settings.border + '; ';
			} else {
				wrapperStyles += '--vault-name-border: ' + DEFAULT_SETTINGS.border + '; ';
			}
			// border-radius
			if (this.settings.borderRadius !== '') {
				wrapperStyles += '--vault-name-border-radius: ' + this.settings.borderRadius + '; ';
			} else {
				wrapperStyles += '--vault-name-border-radius: ' + DEFAULT_SETTINGS.borderRadius + '; ';
			}
			// background-color
			if (this.settings.background !== '') {
				wrapperStyles += '--vault-name-bgcolor: ' + this.settings.background + '; ';
			} else {
				wrapperStyles += '--vault-name-bgcolor: ' + DEFAULT_SETTINGS.background + '; ';
			}
			// set CSS variables on element
			el.setAttribute(
				'style',
				wrapperStyles
			);
		});
		// icon
		if (this.settings.showIcon) {
			const vaultNameIcon = createDiv('nav-vault-name-icon', (el) => {
				let iconStyles:string = '';
				// icon size
				if (this.settings.iconSize !== '') {
					iconStyles += '--vault-name-icon-size: ' + this.settings.iconSize + '; ';
				} else {
					iconStyles += '--vault-name-icon-size: ' + DEFAULT_SETTINGS.iconSize + '; '
				}
				// icon color
				if (this.settings.iconColor !== '') {
					iconStyles += '--vault-name-icon-color: ' + this.settings.iconColor + '; ';
				} else {
					iconStyles += '--vault-name-icon-color: ' + DEFAULT_SETTINGS.iconColor + '; '
				}
				// icon transform: rotate
				if (this.settings.iconRotate !== '') {
					iconStyles += '--vault-name-icon-transform: ' + this.settings.iconRotate + '; ';
				} else {
					iconStyles += '--vault-name-icon-transform: ' + DEFAULT_SETTINGS.iconRotate + '; '
				}
				// set CSS variables on element
				el.setAttribute(
					'style',
					iconStyles
				);
				// append icon to element
				setIcon(el, this.settings.icon);
			});
			// append icon element to wrapper div
			vaultNameWrapper.appendChild(vaultNameIcon);
		}
		// title
		const vaultNameElement = createDiv('nav-vault-name-title', (el) => {
			el.textContent = this.app.vault.getName();
			let titleStyles: string = '';
			// title color
			if (this.settings.titleColor !== '') {
				titleStyles += '--vault-name-title-color: ' + this.settings.titleColor + '; ';
			} else {
				titleStyles += '--vault-name-title-color: ' + DEFAULT_SETTINGS.titleColor + '; ';
			}
			// title font-family
			if (this.settings.titleFont !== '') {
				titleStyles += '--vault-name-title-font: ' + this.settings.titleFont + '; ';
			} else {
				titleStyles += '--vault-name-title-font: ' + DEFAULT_SETTINGS.titleFont + '; ';
			}
			// title font-size
			if (this.settings.titleFontSize !== '') {
				titleStyles += '--vault-name-title-size: ' + this.settings.titleFontSize + '; ';
			} else {
				titleStyles += '--vault-name-title-size: ' + DEFAULT_SETTINGS.titleFontSize + '; ';
			}
			// title letter-spacing
			if (this.settings.titleLetterSpacing !== '') {
				titleStyles += '--vault-name-title-letter-spacing: ' + this.settings.titleLetterSpacing + '; ';
			} else {
				titleStyles += '--vault-name-title-letter-spacing: ' + DEFAULT_SETTINGS.titleLetterSpacing + '; ';
			}
			// title font-weight
			if (this.settings.titleWeight !== '') {
				titleStyles += '--vault-name-title-weight: ' + this.settings.titleWeight + '; ';
			} else {
				titleStyles += '--vault-name-title-weight: ' + DEFAULT_SETTINGS.titleWeight + '; ';
			}
			// set CSS variables on element
			el.setAttribute(
				'style',
				titleStyles
			);
		});
		// append title element
		vaultNameWrapper.appendChild(vaultNameElement);
		// prepend into navigation containter
		navContainer?.prepend(vaultNameWrapper);
	}

	deactivateVaultName() {
		window.activeDocument.querySelector('.nav-vault-name')?.remove();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.deactivateVaultName();
		this.activateVaultName();
	}

}

class VaultNameSettingTab extends PluginSettingTab {
	plugin: VaultNamePlugin;

	constructor(app: App, plugin: VaultNamePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.addClass('vault-name-settings');

		new Setting(containerEl)
			.setName("General styles")
			.setHeading();

		new Setting(containerEl)
			.setName('Sticky')
			.setDesc('Enable to "pin" the vault name to the top of the file explorer. Default: disabled')
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.sticky)
					.onChange(async newValue => {
						this.plugin.settings.sticky = newValue;
						await this.plugin.saveSettings();
					})
			})

		new Setting(containerEl)
      .setName('Alignment')
			.setDesc('Default: flex-start')
      .addDropdown((dropdown) => {
        dropdown
          .addOptions({
            "flex-start": "flex-start",
            "center": "center",
            "flex-end": "flex-end",
          })
          .setValue(this.plugin.settings.alignment !== '' ? this.plugin.settings.alignment : 'flex-start')
          .onChange(async (newValue) => {
            this.plugin.settings.alignment = newValue;
            await this.plugin.saveSettings();
          });
      })

		let descPadding = document.createDocumentFragment();
		descPadding.append(
			"For available CSS variables, see ",
			descPadding.createEl("a", {
				href: "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Spacing",
				text: "Spacing",
				attr: { "aria-label": "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Spacing", "data-tooltip-position": "top", "tabindex": '0' }
			}),
			". Default: var(--size-2-2)"
		);

		new Setting(containerEl)
			.setName('Padding')
			.setDesc(descPadding)
			.addText(text => text
				.setPlaceholder('var(--size-2-2)')
				.setValue(this.plugin.settings.padding)
				.onChange(async (newValue) => {
					this.plugin.settings.padding = newValue;
					await this.plugin.saveSettings();
				})
			)

		let descBackground = document.createDocumentFragment();
		descBackground.append(
			"For available CSS variables, see ",
			descBackground.createEl("a", {
				href: "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Colors",
				text: "Colors",
				attr: { "aria-label": "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Colors", "data-tooltip-position": "top", "tabindex": '0' }
			}),
			". Default: var(--background-secondary)"
		);

		new Setting(containerEl)
			.setName('Background color')
			.setDesc(descBackground)
			.addText(text => text
				.setPlaceholder('var(--background-secondary)')
				.setValue(this.plugin.settings.background)
				.onChange(async (newValue) => {
					this.plugin.settings.background = newValue;
					await this.plugin.saveSettings();
				})
			)

		let descBorder = document.createDocumentFragment();
		descBorder.append(
			"For help with CSS border, see ",
			descBorder.createEl("a", {
				href: "https://developer.mozilla.org/en-US/docs/Web/CSS/border",
				text: "MDN: border",
				attr: { "aria-label": "https://developer.mozilla.org/en-US/docs/Web/CSS/border", "data-tooltip-position": "top", "tabindex": '0' }
			}),
			". Default: none"
		);

		new Setting(containerEl)
			.setName('Border')
			.setDesc(descBorder)
			.addText(text => text
				.setPlaceholder('none')
				.setValue(this.plugin.settings.border)
				.onChange(async (newValue) => {
					this.plugin.settings.border = newValue;
					await this.plugin.saveSettings();
				})
			)

		let descBorderRadius = document.createDocumentFragment();
		descBorderRadius.append(
			"For available CSS variables, see ",
			descBorderRadius.createEl("a", {
				href: "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Radiuses",
				text: "Radiuses",
				attr: { "aria-label": "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Radiuses", "data-tooltip-position": "top", "tabindex": '0' }
			}),
			". Default: var(--radius-m)"
		);

		new Setting(containerEl)
			.setName('Border radius')
			.setDesc(descBorderRadius)
			.addText(text => text
				.setPlaceholder('var(--radius-m)')
				.setValue(this.plugin.settings.borderRadius)
				.onChange(async (newValue) => {
					this.plugin.settings.borderRadius = newValue;
					await this.plugin.saveSettings();
				})
			)


		new Setting(containerEl)
			.setName("Icon styles")
			.setHeading();

		new Setting(containerEl)
			.setName('Show icon')
			.setDesc('Default: disabled')
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.showIcon)
					.onChange(async newValue => {
						this.plugin.settings.showIcon = newValue;
						await this.plugin.saveSettings();
					})
			})

		new Setting(containerEl)
			.setName('Icon')
			.setDesc('To select an icon, click the button. Default: vault')
			.addButton((cb) => {
				cb.setIcon(this.plugin.settings.icon)
					.setTooltip("Select icon")
					.onClick(async (e) => {
						e.preventDefault();
						const modal = new IconSuggestModal(this.plugin);
						modal.open();
					});
				cb.buttonEl.setAttribute("data-note-toolbar-no-icon", !this.plugin.settings.icon ? "true" : "false");
				cb.buttonEl.setAttribute("tabindex", "0");
				this.plugin.registerDomEvent(
					cb.buttonEl, 'keydown', (e) => {
						switch (e.key) {
							case "Enter":
							case " ":
								e.preventDefault();
								const modal = new IconSuggestModal(this.plugin);
								modal.open();
						}
					});
			});

		let descIconSize = document.createDocumentFragment();
		descIconSize.append(
			"For available CSS variables, see ",
			descIconSize.createEl("a", {
				href: "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Icons#Icon+sizes",
				text: "Icon sizes",
				attr: { "aria-label": "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Icons#Icon+sizes", "data-tooltip-position": "top", "tabindex": '0' }
			}),
			". Default: var(--icon-m)"
		);

		new Setting(containerEl)
			.setName('Icon size')
			.setDesc(descIconSize)
			.addText(text => text
				.setPlaceholder('var(--icon-m)')
				.setValue(this.plugin.settings.iconSize)
				.onChange(async (newValue) => {
					this.plugin.settings.iconSize = newValue;
					await this.plugin.saveSettings();
				})
			)
		
		let descIconColor = document.createDocumentFragment();
		descIconColor.append(
			"For available CSS variables, see ",
			descIconColor.createEl("a", {
				href: "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Colors",
				text: "Colors",
				attr: { "aria-label": "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Colors", "data-tooltip-position": "top", "tabindex": '0' }
			}),
			" and ",
			descIconColor.createEl("a", {
				href: "https://docs.obsidian.md/Reference/CSS+variables/Components/Navigation#CSS+variables",
				text: "Navigation",
				attr: { "aria-label": "https://docs.obsidian.md/Reference/CSS+variables/Components/Navigation#CSS+variables", "data-tooltip-position": "top", "tabindex": '0' }
			}),
			". Default: var(--nav-item-color)"
		);

		new Setting(containerEl)
			.setName('Icon color')
			.setDesc(descIconColor)
			.addText(text => text
				.setPlaceholder('var(--nav-item-color)')
				.setValue(this.plugin.settings.iconColor)
				.onChange(async (newValue) => {
					this.plugin.settings.iconColor = newValue;
					await this.plugin.saveSettings();
				})
			)

		let descIconRotate = document.createDocumentFragment();
		descIconRotate.append(
			"For help with CSS rotate, see ",
			descIconRotate.createEl("a", {
				href: "https://developer.mozilla.org/en-US/docs/Web/CSS/rotate",
				text: "MDN: rotate",
				attr: { "aria-label": "https://developer.mozilla.org/en-US/docs/Web/CSS/rotate", "data-tooltip-position": "top", "tabindex": '0' }
			}),
			". Default: 0deg"
		);

		new Setting(containerEl)
			.setName('Rotate')
			.setDesc(descIconRotate)
			.addText(text => text
				.setPlaceholder('0deg')
				.setValue(this.plugin.settings.iconRotate)
				.onChange(async (newValue) => {
					this.plugin.settings.iconRotate = newValue;
					await this.plugin.saveSettings();
				})
			)

		new Setting(containerEl)
			.setName("Title styles")
			.setHeading();

		let descTitleColor = document.createDocumentFragment();
		descTitleColor.append(
			"For available CSS variables, see ",
			descIconColor.createEl("a", {
				href: "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Colors",
				text: "Colors",
				attr: { "aria-label": "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Colors", "data-tooltip-position": "top", "tabindex": '0' }
			}),
			" and ",
			descTitleColor.createEl("a", {
				href: "https://docs.obsidian.md/Reference/CSS+variables/Components/Navigation#CSS+variables",
				text: "Navigation",
				attr: { "aria-label": "https://docs.obsidian.md/Reference/CSS+variables/Components/Navigation#CSS+variables", "data-tooltip-position": "top", "tabindex": '0' }
			}),
			". Default: var(--nav-item-color)"
		);

		new Setting(containerEl)
			.setName('Color')
			.setDesc(descTitleColor)
			.addText(text => text
				.setPlaceholder('var(--nav-item-color)')
				.setValue(this.plugin.settings.titleColor)
				.onChange(async (newValue) => {
					this.plugin.settings.titleColor = newValue;
					await this.plugin.saveSettings();
				})
			)

		let descFont = document.createDocumentFragment();
		descFont.append(
			"For available CSS variables, see ",
			descFont.createEl("a", {
				href: "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Typography#Fonts",
				text: "Typography",
				attr: { "aria-label": "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Typography#Fonts", "data-tooltip-position": "top", "tabindex": '0' }
			}),
			". Default: var(--font-interface)"
		);

		new Setting(containerEl)
			.setName('Font')
			.setDesc(descFont)
			.addText(text => text
				.setPlaceholder('var(--font-interface)')
				.setValue(this.plugin.settings.titleFont)
				.onChange(async (newValue) => {
					this.plugin.settings.titleFont = newValue;
					await this.plugin.saveSettings();
				})
			)

		let descFontSize = document.createDocumentFragment();
		descFontSize.append(
			"For available CSS variables, see ",
			descFontSize.createEl("a", {
				href: "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Typography#Font+size",
				text: "Typography",
				attr: { "aria-label": "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Typography#Font+size", "data-tooltip-position": "top", "tabindex": '0' }
			}),
			". Default: var(--font-ui-medium)"
		);

		new Setting(containerEl)
			.setName('Font size')
			.setDesc(descFontSize)
			.addText(text => text
				.setPlaceholder('var(--font-ui-medium)')
				.setValue(this.plugin.settings.titleFontSize)
				.onChange(async (newValue) => {
					this.plugin.settings.titleFontSize = newValue;
					await this.plugin.saveSettings();
				})
			)

		let descFontWeight = document.createDocumentFragment();
		descFontWeight.append(
			"For available CSS variables, see ",
			descFontWeight.createEl("a", {
				href: "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Typography#Font+weight",
				text: "Typography",
				attr: { "aria-label": "https://docs.obsidian.md/Reference/CSS+variables/Foundations/Typography#Font+weight", "data-tooltip-position": "top", "tabindex": '0' }
			}),
			". Default: var(--font-normal)"
		);
		
		new Setting(containerEl)
			.setName('Font weight')
			.setDesc(descFontWeight)
			.addText(text => text
				.setPlaceholder('var(--font-normal)')
				.setValue(this.plugin.settings.titleWeight)
				.onChange(async (newValue) => {
					this.plugin.settings.titleWeight = newValue;
					await this.plugin.saveSettings();
				})
			)

		let descLetterSpacing = document.createDocumentFragment();
		descLetterSpacing.append(
			"For help with CSS letter-spacing, see ",
			descLetterSpacing.createEl("a", {
				href: "https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing",
				text: "MDN: letter-spacing",
				attr: { "aria-label": "https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing", "data-tooltip-position": "top", "tabindex": '0' }
			}),
			". Default: normal"
		);

		new Setting(containerEl)
		.setName('Letter spacing')
		.setDesc(descLetterSpacing)
		.addText(text => text
			.setPlaceholder('normal')
			.setValue(this.plugin.settings.titleLetterSpacing)
			.onChange(async (newValue) => {
				this.plugin.settings.titleLetterSpacing = newValue;
				await this.plugin.saveSettings();
			})
		)

	}
}

/**
 * credit: https://github.com/chrisgurney/obsidian-note-toolbar/tree/master/src/Settings/IconSuggestModal.ts
 */
class IconSuggestModal extends SuggestModal<IconName> {
	public plugin: VaultNamePlugin;

	constructor(plugin: VaultNamePlugin) {
		super(plugin.app);
		this.modalEl.addClass("vault-name-icon-select-modal");
		this.plugin = plugin;
		this.setPlaceholder("Search for an icon");
		this.setInstructions([
			{command: '↑↓', purpose: 'to navigate'},
			{command: '↵', purpose: 'to use'},
			{command: 'esc', purpose: 'to dismiss'},
		]);
	}

	getSuggestions(inputStr: string): IconName[] {
			const iconIds = getIconIds();
			const iconSuggestions: IconName[] = [];
			const lowerCaseInputStr = inputStr.toLowerCase();
			iconSuggestions.push("No icon");
			iconIds.forEach((icon: IconName) => {
					if (icon.toLowerCase().contains(lowerCaseInputStr)) {
							iconSuggestions.push(icon);
					}
			});
			return iconSuggestions;
	}

	renderSuggestion(icon: IconName, el: HTMLElement): void {
			el.addClass("vault-name-icon-suggestion");
			let iconName = el.createSpan();
			if (icon === "No icon") {
					iconName.setText(icon);
			}
			else {
					iconName.setText(icon.startsWith("lucide-") ? icon.substring(7) : icon);
					let iconGlyph = el.createSpan();
					setIcon(iconGlyph, icon);
			}
	}

	/**
	 * Saves the selected icon to settings, closes the modal, refreshes the parent.
	 * @param selectedIcon Icon to save.
	 */
	onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) {
			this.plugin.settings.icon = item;
			this.plugin.saveSettings();
			setIcon(activeDocument.querySelector('[data-note-toolbar-no-icon]')!, item);
			this.close();
	}

}