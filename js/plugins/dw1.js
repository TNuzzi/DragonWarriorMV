(function() {
    var redPixiFilter = new PIXI.filters.MultiColorReplaceFilter(
        [
            [0xFFFFFF, 0xf27a6a] // Convert white to damage red
        ],
        0.001);

    var sideWithDragonlordPixiFilter = new PIXI.filters.MultiColorReplaceFilter(
        [
            [0xFFFFFF, 0xb53120], // red
        ],
        0.001);

    /**
     *      _____                       __  __             
     *     / ____|                     |  \/  |            
     *    | (___   ___ ___ _ __   ___  | \  / | __ _ _ __  
     *     \___ \ / __/ _ \ '_ \ / _ \ | |\/| |/ _` | '_ \ 
     *     ____) | (_|  __/ | | |  __/ | |  | | (_| | |_) |
     *    |_____/ \___\___|_| |_|\___| |_|  |_|\__,_| .__/ 
     *                              ______           | |    
     *                             |______|          |_|   
     */

    /**
     * Overriding _Scene_Map_createAllWindows because the choice window
     * should have a higher display order over the DW command window
     */
    var _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        $gamePlayer.setStepAnime(true);
        this._dwStatusWindow = new DW_Status_Window(baseWidth() * .5, baseHeight() * 2);
        this.addWindow(this._dwStatusWindow);
        this._dwCommandWindow = new DW_Command_Window(baseWidth() * 6, baseHeight());
        this.addWindow(this._dwCommandWindow);
        this._dwMainStatusWindow = new DW_Main_Status_Window(baseWidth() * 5, baseHeight() * 3);
        this._dwSpellWindow = new DW_Spell_Window(baseWidth() * 10, baseHeight() * 2);
        this._shopWindow = new DW_Shop_Window(baseWidth() * 5, baseHeight() * 2);
        this._dwItemWindow = new DW_Item_Window(baseWidth() * 10, baseHeight() * 2.25);

        _Scene_Map_createAllWindows.call(this);

        this._messageWindow._shopWindow = this._shopWindow;
        this._shopWindow._messageWindow = this._messageWindow;

        this._messageWindow._dwItemWindow = this._dwItemWindow;
        this._dwItemWindow._messageWindow = this._messageWindow;

        this.addWindow(this._dwMainStatusWindow);
        this.addWindow(this._dwSpellWindow);
        this.addWindow(this._shopWindow);
        this.addWindow(this._dwItemWindow);
    };

    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);

        if ($gameSwitches.value(81)) { // Side with Dragonlord
            $gameMap.changeTileset(3);
            this._messageWindow.filters = $gameSystem.sideWithDragonlordPixiFilter();
            this._messageWindow._choiceWindow.filters = $gameSystem.sideWithDragonlordPixiFilter();
            this._dwStatusWindow.filters = $gameSystem.sideWithDragonlordPixiFilter();
            this._dwCommandWindow.filters = $gameSystem.sideWithDragonlordPixiFilter();
            this._dwMainStatusWindow.filters = $gameSystem.sideWithDragonlordPixiFilter();
            this._dwSpellWindow.filters = $gameSystem.sideWithDragonlordPixiFilter();
            this._shopWindow.filters = $gameSystem.sideWithDragonlordPixiFilter();
            this._dwItemWindow.filters = $gameSystem.sideWithDragonlordPixiFilter();
            this._dwStatusWindow.refresh();
            this._dwCommandWindow.refresh();
            $gamePlayer._vehicleGettingOn = true; // Don't allow player to move
            $gamePlayer.setStepAnime(false);
            $gameMap.events().forEach(function(event) {
                event.setStepAnime(false);
                event.setWalkAnime(false);
                event.lock();
            });

            return;
        }
        
        if ($gameActors.actor(1).hasLowHp() &&
            this._messageWindow.filters === null ) {
            $gameMap.changeTileset(2);
            this._messageWindow.filters = $gameSystem.redPIXIFilter();
            this._messageWindow._choiceWindow.filters = $gameSystem.redPIXIFilter();
            this._dwStatusWindow.filters = $gameSystem.redPIXIFilter();
            this._dwCommandWindow.filters = $gameSystem.redPIXIFilter();
            this._dwMainStatusWindow.filters = $gameSystem.redPIXIFilter();
            this._dwSpellWindow.filters = $gameSystem.redPIXIFilter();
            this._shopWindow.filters = $gameSystem.redPIXIFilter();
            this._dwItemWindow.filters = $gameSystem.redPIXIFilter();    
        } else if (!$gameActors.actor(1).hasLowHp() && 
                   this._messageWindow.filters !== null) {
            $gameMap.changeTileset(1);
            this._messageWindow.filters = null;
            this._messageWindow._choiceWindow.filters = null;
            this._dwStatusWindow.filters = null;
            this._dwCommandWindow.filters = null;
            this._dwMainStatusWindow.filters = null;
            this._dwSpellWindow.filters = null;
            this._shopWindow.filters = null;
            this._dwItemWindow.filters = null;
            this._dwStatusWindow.refresh();
            this._dwCommandWindow.refresh();  
        }
    
        /**
         * If game has not started wait for player to press a button to start king talking.
         */
        if ($gameSwitches.value(84)) {
            $gamePlayer._vehicleGettingOn = true; // Don't allow player to move
            if (!$gameSwitches.value(85)) {
                if(Input.isTriggered('start') || Input.isTriggered('ok')) {
                    $gameSwitches.setValue(85, true);
                }
            } else {
                if(Input.isTriggered('start') || Input.isTriggered('ok')) {
                    $gameSwitches.setValue(86, true); // Title select screen
                    $gamePlayer.reserveTransfer(35, 0, 0, 8, 0); // Title Option screen
                }
            }

            return;
        } else if ($gameSwitches.value(86)) {
            $gamePlayer._vehicleGettingOn = true; // Don't allow player to move
            this._dwCommandWindow.hideWindow();
            this._dwSpellWindow.hideWindow();
            this._dwItemWindow.hideWindow();
            this._dwMainStatusWindow.hide();
            this._dwStatusWindow.hide();
            return;
        } else if (!$gameSwitches.value(1) && !$gameSwitches.value(84) && !$gameSwitches.value(86)) {
            $gamePlayer._vehicleGettingOn = true; // Don't allow player to move
            if((Input.isTriggered('ok') || Input.isTriggered('cancel') || Input.dir4 !== 0)) {
                // If player starts game then pause all other animation until king stops talking.
                $gamePlayer.setStepAnime(false);
                $gameMap.events().forEach(function(event) {
                    event.setStepAnime(false);
                    event.setWalkAnime(false);
                    event.lock();
                });
                $gameSwitches.setValue(19, true);
            }
            return;
        } else if (($gameSwitches.value(45) || $gameSwitches.value(66)) && !$gameSwitches.value(84) && !$gameSwitches.value(86)) { // Recused Princess or Just died
            $gamePlayer._vehicleGettingOn = true; // Don't allow player to move
            var eventId = $gameMap.eventIdXy($gamePlayer.x, $gamePlayer.y - 1);
            var event = $gameMap.event(eventId);
            if((Input.isTriggered('ok') || Input.isTriggered('cancel') || Input.dir4 !== 0) && event) {
                // If player starts game then pause all other animation until king stops talking.
                $gamePlayer.setStepAnime(false);
                $gameMap.events().forEach(function(event) {
                    event.setStepAnime(false);
                    event.setWalkAnime(false);
                    event.lock();
                });
                return event.start();
            }
            return;
        }

        /**
         * This logic it to hide the status window when the player is moving
         * and to show 1 second after the player stops.
         * 
         * NOTE: $gameSwitch.value(2) is a global switch that is used to indicate
         * the player is talking to an NPC.  We don't want the status window 
         * to hide if the player pushes the keyboard move keys on an option select
         * menu.
         */
        if((Input.dir4 !== 0 || $gamePlayer.isMoving()) && !$gameSwitches.value(2)) {
            if (this._dwCommandWindow.visible) {
                return;
            }

            clearTimeout(this.__windowTimer);
            this.__windowTimer = undefined;
            this._dwStatusWindow.hide();
        } else {
            var that = this;
            if(!this.__windowTimer) {
                this.__windowTimer = setTimeout(function() {
                    if (!that._startingBattle) {
                        that._dwStatusWindow.show();
                    }
                }, 1250);
            } else {
                that._dwStatusWindow.refresh();
            }
        }
        
        // Ignore action if Player is talking to someone.
        if (!$gameSwitches.value(2)) {
            if((Input.isTriggered('ok') || Input.isTriggered('shift')) && !this._dwCommandWindow.visible) {
                SoundManager.playBuzzer();
                this._dwStatusWindow.show();
                this._dwCommandWindow.showWindow();
            } else if((Input.isTriggered('ok') || Input.isTriggered('shift')) && this._dwMainStatusWindow.visible) {
                SoundManager.playBuzzer();
                this._dwCommandWindow.hideWindow();
                this._dwMainStatusWindow.hide();
            } else if((Input.isTriggered('ok') || Input.isTriggered('shift')) && this._dwSpellWindow.visible) {
                SoundManager.playBuzzer();
                this._dwCommandWindow.hideWindow();
                this._dwSpellWindow.hideWindow();
            } else if(Input.isTriggered('cancel')) {
                this._dwCommandWindow.hideWindow();
                this._dwSpellWindow.hideWindow();
                this._dwItemWindow.hideWindow();
                this._dwMainStatusWindow.hide();
            }    
        }
    };

    Scene_Map.prototype.sceneTransfer = function() {
        this._dwCommandWindow.hideWindow();
        this._dwStatusWindow.hide();
        clearTimeout(this.__windowTimer);
        this.__windowTimer = undefined;
        var that = this;
        if(!$gameParty.inBattle()) {
            this.__windowTimer = setTimeout(function() {
                that._dwStatusWindow.show();
            }, 1250);    
        }
    }

    Scene_Map.prototype.shop = function() {
        this._dwShopWindow.showWindow();
    }

    // Not sure where to add this.
    Scene_Map.prototype.dwSellItem = function() {
        var itemForSell = $gameTemp.itemForSell;

        // User cancelled sell
        if (!itemForSell) {
            return;
        }

        var name = itemForSell.item.name;
        var price = itemForSell.price;

        $gameParty.gainGold(price);
        $gameParty.loseItem(itemForSell.item, 1, true);
     
        $gameTemp.itemForSell = undefined;
    }

    Scene_Map.prototype.dwPurchaseItemAndEquip = function() {
        var itemForPurchase = $gameTemp.itemForPurchase;
        var itemObj = itemForPurchase.item;

        // User cancelled sell
        if (!itemForPurchase) {
            return;
        }

        var price = itemForPurchase.price;

        $gameParty.loseGold(price);
        $gameParty.gainItem(itemObj, 1);
        $gameActors.actor(1).changeEquipById(itemObj.etypeId, itemObj.id);

        $gameTemp.itemForPurchase = undefined;
        $gameSwitches.setValue(7, false);
        $gameVariables.setValue(6, '');
    }

    /**
     * Removed called Menu
     */
    Scene_Map.prototype.updateScene = function() {
        this.checkGameover();
        if (!SceneManager.isSceneChanging()) {
            this.updateTransferPlayer();
        }
        if (!SceneManager.isSceneChanging()) {
            this.updateEncounter();
        }
        if (!SceneManager.isSceneChanging()) {
            this.updateCallDebug();
        }
    };

    /**
     *      _____                       __  __                  
     *     / ____|                     |  \/  |                 
     *    | (___   ___ ___ _ __   ___  | \  / | ___ _ __  _   _ 
     *     \___ \ / __/ _ \ '_ \ / _ \ | |\/| |/ _ \ '_ \| | | |
     *     ____) | (_|  __/ | | |  __/ | |  | |  __/ | | | |_| |
     *    |_____/ \___\___|_| |_|\___| |_|  |_|\___|_| |_|\__,_|
     *                              ______                       
     *                             |______|  
     */

    /**
     * Override default Scene create and start removing unused
     * windows (gold and status)
     */
    Scene_Menu.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createCommandWindow();
    };
    
    Scene_Menu.prototype.start = function() {
        Scene_MenuBase.prototype.start.call(this);
    };

    Scene_Menu.prototype.onPersonalCancel = function() {
        this._commandWindow.activate();
    };

    /**
      *    _____                        __  __                                
      *   / ____|                      |  \/  |                               
      *  | |  __  __ _ _ __ ___   ___  | \  / | ___  ___ ___  __ _  __ _  ___ 
      *  | | |_ |/ _` | '_ ` _ \ / _ \ | |\/| |/ _ \/ __/ __|/ _` |/ _` |/ _ \
      *  | |__| | (_| | | | | | |  __/ | |  | |  __/\__ \__ \ (_| | (_| |  __/
      *   \_____|\__,_|_| |_| |_|\___| |_|  |_|\___||___/___/\__,_|\__, |\___|
      *                            ______                           __/ |     
      *                           |______|                         |___/      
     */

    Game_Message.prototype.allText = function() {
        return (this._texts || []).join(' ');
    };

    /**
      *      __          ___           _               __  __                                
      *      \ \        / (_)         | |             |  \/  |                               
      *       \ \  /\  / / _ _ __   __| | _____      _| \  / | ___  ___ ___  __ _  __ _  ___ 
      *        \ \/  \/ / | | '_ \ / _` |/ _ \ \ /\ / / |\/| |/ _ \/ __/ __|/ _` |/ _` |/ _ \
      *         \  /\  /  | | | | | (_| | (_) \ V  V /| |  | |  __/\__ \__ \ (_| | (_| |  __/
      *          \/  \/   |_|_| |_|\__,_|\___/ \_/\_/ |_|  |_|\___||___/___/\__,_|\__, |\___|
      *                                           ______                           __/ |     
      *                                          |______|                         |___/      
     */

    var _DW_Window_Message_initMembers =  Window_Message.prototype.initMembers;
    Window_Message.prototype.initMembers = function() {
        _DW_Window_Message_initMembers.call(this);
        this._currentLine = 0;
    };

    Window_Message.prototype.standardFontSize = function() {
        return 20;
    }

    Window_Message.prototype.standardBackOpacity = function() {
        return 255;
    };

    Window_Message.prototype.standardPadding = function() {
        return 32;
    };

    Window_Message.prototype.lineHeight = function() {
        return 28;
    };

    Window_Message.prototype.numVisibleRows = function() {
        return 5;
    };

    Window_Message.prototype.windowWidth = function() {
        return baseWidth() * 12;
    };
    
    Window_Message.prototype.windowHeight = function() {
        return (baseWidth() * 4) + 10;
    };

    Window_Message.prototype.updatePlacement = function() {
        this._positionType = $gameMessage.positionType();
        this.y = (this._positionType * (Graphics.boxHeight - this.height) / 2) - (baseHeight() - 10);
    };

    Window_Message.prototype.resetFontSettings = function(bitmap) {
        if (!bitmap) {
            bitmap = this.contents;
        } 

        bitmap.fontFace = this.standardFontFace();
        bitmap.fontSize = this.standardFontSize();
        this.resetTextColor();
    };

    Window_Message.prototype.createContents = function() {
        this.contents = new Bitmap(this.contentsWidth(), this.contentsHeight());
        this.scrollContents = new Sprite();
        this.scrollContents.bitmap = new Bitmap(this.contentsWidth(), this.contentsHeight());
        this.scrollContents.bitmap.fillRect(0, 0, this.contentsWidth(), this.contentsHeight(), '#ffffff');
        this.scrollContents.move(this.standardPadding(), this.standardPadding());
        this.children[0].addChild(this.scrollContents);

        for (var index = 0; index < this.numVisibleRows(); index++) {
            var newline = new Sprite();
            newline._text = '';
            newline.bitmap = new Bitmap(this.contentsWidth(), this.lineHeight());
            newline.bitmap.fillRect(0, 0, this.contentsWidth(), this.lineHeight(), '#000000');
            newline.move(0, this.lineHeight() * index);
            this.resetFontSettings(newline.bitmap);
            this.scrollContents.addChild(newline); 
        }

        this.removeChild(this._windowPauseSignSprite);
        this.addChild(this._windowPauseSignSprite);
        this.resetFontSettings();
    };

    Window_Message.prototype.startMessage = function() {
        this._textState = {};
        this._textState.index = 0;
        this._textState.text = this.convertEscapeCharacters($gameMessage.allText());
        this.insertNewlines();
        this.newPage(this._textState);
        this.updatePlacement();
        this.updateBackground();
        this.open();
    };

    Window_Message.prototype.insertNewlines = function() {
        var text = this._textState.text;
        var words = this._textState.text.split(' ');
        var contentsWidth = this.contents.width - 100;
        var newText = '';
        var currentLineWidth = 0;
        for (var index = 0; index < words.length; index++) {
            var word = words[index].trim();
            var textWidth = this.textWidth(word);
            currentLineWidth += textWidth;

            var hasPipe = word.split('|');
            if (hasPipe.length > 1) {
                for (var a = 0; a < hasPipe.length; a++) {
                    if (hasPipe[a] === '') {
                        newText = newText + '\n';
                    } else {
                        word = hasPipe.slice(a, hasPipe.length);
                        newText =  newText + word;
                        currentLineWidth = this.textWidth(word);   
                    }
                }
            } else {
                if (currentLineWidth > contentsWidth) {
                    newText = newText + '\n' + word;
                    currentLineWidth = 0;
                    currentLineWidth += textWidth;
    
                } else {
                    if (newText === '') {
                        newText = word;
                    } else {
                        newText = newText + ' ' + word;
                    }
                } 
            }
        }
        this._textState.text = newText;
    };

    Window_Message.prototype.processNewLine = function(textState) {
        if (this._currentLine !== (this.numVisibleRows() - 1)) {
            this._currentLine++;
        } else {
            this.moveTextUp();
        }

        this._lineShowFast = false;
        Window_Base.prototype.processNewLine.call(this, textState);
        if (this.needsNewPage(textState)) {
            this.startPause();
        }
    };

    Window_Message.prototype.processNormalCharacter = function(textState) {
        var c = textState.text[textState.index++];
        var w = this.textWidth(c);
        var contents = this.scrollContents.children[this._currentLine];
        contents._text += c;

        if ($gameSwitches.value(81)) {
            contents.bitmap.textColor = '#b53120';
        } else if ($gameActors.actor(1).hasLowHp()) {
            contents.bitmap.textColor = '#f27a6a';
        } else {
            contents.bitmap.textColor = '#ffffff';
        }

        contents.bitmap.drawText(c, textState.x, 0, w * 2, textState.height);
        textState.x += w;
    };

    Window_Message.prototype.newPage = function(textState) {
        if(this._currentLine !== 0) {
            if (this._currentLine >= 4) {
                this.moveTextUp();
                this._currentLine = 4;
            } else {
                if (this._currentLine > 3) {
                    this.moveTextUp();
                }

                /**
                 * Weird logic alert:
                 * If the user is not in a battle and the above conditions are not met then
                 * add an new line with every new page.
                 * Else if in a battle but there is only 1 don't add a new line the battle
                 * text will add a new line
                 */
                if (!$gameParty.inBattle()) {
                    this._currentLine++;
                } else if (this._currentLine !== 1) {
                    this._currentLine++;
                }
            }
        }

        if (textState.text.startsWith("'") ||  // Look for ' in start of message
            textState.text.startsWith("`'") || 
            textState.text.startsWith("\n'") || 
            textState.text.startsWith("\n`'") || 
            textState.text.startsWith("\n\n'")) { 
            $gameSwitches.setValue(13, true);
        }
        this.contents.clear();
        this.resetFontSettings();
        this.clearFlags();
        this.loadMessageFace();
        textState.x = this.newLineX();
        textState.y = 0;
        textState.left = this.newLineX();
        textState.height = this.calcTextHeight(textState, false);
    };

    Window_Message.prototype.checkToNotClose = function() {
        if (this.isClosing() && this.isOpen()) {
            // Always stay open in battle
            // Scene will manually close window
            if (($gameParty.inBattle() && !BattleManager.isBattleEnd()) || $gameSwitches.value(14)) {
                this.open();
            } else if (BattleManager.isBattleEnd()) {
                this.openness = 0; // Close message window immediately
            }

            if (this.doesContinue()) {
                if(this._currentLine === 0) {
                    this._currentLine++;
                }
                this.open();
            } else {
                if (!$gameParty.inBattle() && !$gameSwitches.value(14)) { // Not in battle and not performing magic outside of battle
                    SceneManager._scene._dwCommandWindow && SceneManager._scene._dwCommandWindow.hideWindow();
                    this._currentLine = 0;
                    for (var index = 0; index < this.scrollContents.children.length; index++) {
                        var line = this.scrollContents.children[index];
                        line._text = '';
                        line.bitmap.clear();
                        line.bitmap.fillRect(0, 0, this.contentsWidth(), this.lineHeight(), '#000000');
                    }
                }
            }
        }
    };

    Window_Message.prototype.moveTextUp = function() {
        for (var index = 0; index < this.scrollContents.children.length - 1; index++) {
            var currectLine = this.scrollContents.children[index];
            var nextLine = this.scrollContents.children[index + 1];
            currectLine._text = nextLine._text;
            currectLine.bitmap.fillRect(0, 0, this.contentsWidth(), this.lineHeight(), '#000000');
            if ($gameSwitches.value(81)) {
                currectLine.bitmap.textColor = '#b53120';
            } else if ($gameActors.actor(1).hasLowHp()) {
                currectLine.bitmap.textColor = '#f27a6a';
            } else {
                currectLine.bitmap.textColor = '#ffffff';
            }
            currectLine.bitmap.drawText(currectLine._text, 0, 0, currectLine.width, currectLine.height);
        }

        var lastLine = this.scrollContents.children[this.scrollContents.children.length - 1];
        lastLine._text = '';
        lastLine.bitmap.fillRect(0, 0, this.contentsWidth(), this.lineHeight(), '#000000');
    }

    Window_Message.prototype.updateMessage = function() {
        if (this._textState) {
            if ($gameParty.inBattle()) {
                this._textState.text = this.convertEscapeCharacters($gameMessage.allText());
                this.insertNewlines();
            }

            while (!this.isEndOfText(this._textState)) {
                this.updateShowFast();
                this.processCharacter(this._textState);
                if (!this._showFast && !this._lineShowFast) {
                    break;
                }
                if (this.pause || this._waitCount > 0) {
                    break;
                }
            }
            if (this.isEndOfText(this._textState)) {
                this.onEndOfText();
            }
            return true;
        } else {
            return false;
        }
    };

    Window_Message.prototype.processCharacter = function(textState) {
        switch (textState.text[textState.index]) {
        case '`':
            $gameSwitches.setValue(16, true); // Don't show pause arrow
            textState.index++;
            break;
        case '\n':
            this.processNewLine(textState);
            break;
        case '\f':
            this.processNewPage(textState);
            break;
        case '\x1b':
            this.processEscapeCharacter(this.obtainEscapeCode(textState), textState);
            break;
        default:
            if(textState.index % 2 === 0 && 
               !$gameParty.inBattle() && 
               $gameSwitches.value(13)) { // Value 13 indicates the user is chatting with someone
                SoundManager.playReflection();
            }
            this.processNormalCharacter(textState);
            break;
        }
    };

    Window_Message.prototype._updatePauseSign = function() {
        var sprite = this._windowPauseSignSprite;
        var x = Math.floor(this._animationCount / 16) % 2;
        var y = Math.floor(this._animationCount / 16 / 2) % 2;
        var sx = 144;
        var sy = 96;
        var p = 24;
        if (!this.pause ||
            (!$gameParty.members()[0]._showPauseSignForLevelUp && $gameParty.inBattle())) {
            sprite.alpha = 0;
        } else if (sprite.alpha < 1 && 
                   !$gameSwitches.value(16) && 
                   (!$gameParty.inBattle() || 
                    ($gameParty.members()[0]._showPauseSignForLevelUp && $gameParty.inBattle()))
                ) {
            y = this.lineHeight() * (this._currentLine + 3);
            sprite.move(sprite.x, y);
            sprite.alpha = Math.min(sprite.alpha + 0.1, 1);
        }
        sprite.setFrame(sx+x*p, sy+y*p, p, p);
        sprite.visible = this.isOpen();
    };

    Window_Message.prototype.isAnySubWindowActive = function() {
        return (this._choiceWindow.active ||
            this._numberWindow.active ||
            this._itemWindow.active ||
            (this._shopWindow && this._shopWindow.active) ||
            (this._dwItemWindow && this._dwItemWindow.active));   
    };

    Window_Message.prototype.startInput = function() {
        if ($gameParty.inBattle()) {
            return false;
        } else if (BattleManager.isBattleEnd()) {
            return true;
        } else {
            if ($gameSwitches.value(5)) {
                this._dwItemWindow.showWindow();
                return true;
            } else if ($gameTemp.hasShopItem()) {
                this._shopWindow.showWindow();
                return true;
            } else if ($gameMessage.isChoice()) {
                SoundManager.playCursor();
                this._choiceWindow.start();
                return true;
            } else if ($gameMessage.isNumberInput()) {
                this._numberWindow.start();
                return true;
            } else if ($gameMessage.isItemChoice()) {
                this._itemWindow.start();
                return true;
            } else if ($gameSwitches.value(15)) { // Allow user to hit enter after non-battle spell
                $gameSwitches.setValue(16, true);
                this.pause = true;
                return true;
            } else {
                return false;
            }    
        }
    };

    Window_Message.prototype.updateInput = function() {
        // Ignore during battle.
        if ($gameParty.inBattle() && !BattleManager.isBattleEnd()) {
            return false;
        }

        if (this.isAnySubWindowActive()) {
            return true;
        }
        if (this.pause) {
            if (BattleManager.isBattleEnd() && $gameMessage._texts.length !== 0) {
                this.pause = false;
                return false;
            }

            if (this.isTriggered()) {
                Input.update();
                this.pause = false;
                if (!this._textState) {
                    this.terminateMessage();
                }
            }
            return true;
        }
        return false;
    };

    Window_Message.prototype.onEndOfText = function() {
        if ($gameParty.inBattle()) {
           $gameMessage.clear();
        }

        if (this._currentLine === 0) {
            this._currentLine++;
        }

        if (!this.startInput()) {
            if (!this._pauseSkip) {
                this.startPause();
            } else {
                this.terminateMessage();
            }
        }
        this._textState = null;
    };

    Window_Message.prototype.needsNewPage = function(textState) {
        return false;
    };

    var _DW_Window_Message_update = Window_Message.prototype.update;
    Window_Message.prototype.update = function() {
        if (BattleManager.isBattleEnd()) {
            this.checkToNotClose();
            Window_Base.prototype.update.call(this);    
            while (!this.isOpening() && !this.isClosing()) {
                if (this.updateWait()) {
                    return;
                } else if (this.updateLoading()) {
                    return;
                } else if (this.updateMessage()) {
                    return;
                } else if (this.updateInput()) {
                    return;
                } else if (this.canStart()) {
                    this.startMessage();
                } else {
                    this.startInput();
                    return;
                }
            }    
        } else {
            _DW_Window_Message_update.call(this);
        }
    };

    Window_Message.prototype.terminateMessage = function() {
        this.close();
        $gameMessage.clear();
        $gameSwitches.setValue(13, false); // Chatting with NPC
        $gameSwitches.setValue(15, false); // Non battle spell
        $gameSwitches.setValue(16, false); // Non battle spell
    };

    /**
     * DW Status window that show in the left side of screen.  It displays
     * Level, Hit Points, Magic Points, Gold, and Experience
     */
    function DW_Status_Window() {
        this.initialize.apply(this, arguments);
    }

    
    DW_Status_Window.prototype = Object.create(Window_Base.prototype);
    DW_Status_Window.prototype.constructor = DW_Status_Window;

    DW_Status_Window.prototype.initialize = function(x, y) {
        Window_Base.prototype.initialize.call(this, x, y, this.windowWidth(), this.windowHeight());
        this.contents.fontSize = 24;
        this.createTitle();
        this.hide();
    }

    DW_Status_Window.prototype.createTitle = function() {
        var titleName = $gameActors.actor(1).name().slice(0, 4).toUpperCase();
        var title = new Sprite();
        title.bitmap = new Bitmap(22 * 4, 22);
        title.bitmap.fontSize = 22;
        title.bitmap.fillRect(0, 0, 22 * 4, 28, '#000000');
        title.bitmap.drawText(titleName, 0, 0, 22 * 4, 28, 'left');
        title.x = this.width / 2 - title.width / 2;
        
        this._titleName = titleName;
        this._title = title;
        this.addChild(title);
    }

    DW_Status_Window.prototype.refresh = function() {
        this.contents.clear();
        var player = $gameActors.actor(1);

        if ($gameSwitches.value(81)) {
            this.contents.textColor = '#b53120';
            this._title.bitmap.textColor = '#b53120';
        } else if ($gameActors.actor(1).hasLowHp()) {
            this.contents.textColor = '#f27a6a';
            this._title.bitmap.textColor = '#f27a6a';
        } else {
            this.contents.textColor = '#ffffff';
            this._title.bitmap.textColor = '#ffffff';
        }

        refreshTitle(this._title, this._titleName);

        // Level
        this.drawText('LV', 4, baseWidth() * 0.25, baseWidth(), 'left');
        this.drawText(player.level, baseWidth(), baseWidth() * 0.25, baseWidth() * 2.5, 'right');

        // Hit Points
        this.drawText('HP', 4, baseWidth() * 1.25 , baseWidth(), 'left');
        this.drawText(player.hp, baseWidth(), baseWidth() * 1.25, baseWidth() * 2.5, 'right');

        // Magic Points
        this.drawText('MP', 4,baseWidth() * 2.25, baseWidth(), 'left');
        this.drawText(player.mp, baseWidth(),baseWidth() * 2.25, baseWidth() * 2.5, 'right');

        // Gold
        this.drawText('G', 4, baseWidth() * 3.25, baseWidth(), 'left');
        this.drawText($gameParty.gold(), baseWidth(), baseWidth() * 3.25, baseWidth() * 2.5, 'right');

        // Experience
        this.drawText('E', 4, baseWidth() * 4.25, baseWidth(), 'left');
        this.drawText(player.currentExp(), baseWidth(), baseWidth() * 4.25, baseWidth() * 2.5, 'right');
    }

    DW_Status_Window.prototype.windowWidth = function() {
        return baseWidth() * 4.5;
    }

    DW_Status_Window.prototype.windowHeight = function() {
        return 267;
    }

     /**
     * DW command window that show in the upper right side of screen.  It displays
     * the action command the player can take in a non combat scenario
     */
    function DW_Command_Window() {
        this.initialize.apply(this, arguments);
    }

    DW_Command_Window.prototype = Object.create(Window_MenuCommand.prototype);
    DW_Command_Window.prototype.constructor = DW_Command_Window;

    var Window_MenuCommand_initialize = Window_MenuCommand.prototype.initialize;
    DW_Command_Window.prototype.initialize = function(x, y, messageWindow) {
        Window_MenuCommand_initialize.call(this, x, y, this.windowWidth(), this.windowHeight());
        this.createTitle();
        this.setHandler('talk',   this.onTalk.bind(this));
        this.setHandler('spell',  this.onSpell.bind(this));
        this.setHandler('status', this.onStatus.bind(this));
        this.setHandler('item',   this.onItem.bind(this));
        this.setHandler('stairs', this.onStairs.bind(this));
        this.setHandler('door',   this.onDoor.bind(this));
        this.setHandler('search', this.onSearch.bind(this));
        this.setHandler('take',   this.onTake.bind(this));
        this.deactivate();
        this.hide();
    }

    DW_Command_Window.prototype.createTitle = function() {
        var titleName = 'COMMAND';
        var title = new Sprite();
        title.bitmap = new Bitmap(22 * 7, 22);
        title.bitmap.fontSize = 22;
        title.bitmap.fillRect(0, 0, 22 * 7, 28, '#000000');
        title.bitmap.drawText(titleName, 0, 0, 22 * 7, 28, 'left');
        title.x = this.width / 2 - title.width / 2;

        this._titleName = titleName;
        this._title = title;
        this.addChild(title);
    }
    
    DW_Command_Window.prototype.makeCommandList = function() {
        var enabled = this.areMainCommandsEnabled();
        this.addCommand('TALK', 'talk', enabled);
        this.addCommand('SPELL', 'spell', enabled);
        this.addCommand('STATUS', 'status', enabled);
        this.addCommand('ITEM', 'item', enabled);
        this.addCommand('STAIRS', 'stairs', enabled);
        this.addCommand('DOOR', 'door', enabled);
        this.addCommand('SEARCH', 'search', enabled);
        this.addCommand('TAKE', 'take', enabled);
    };

    var _Window_MenuCommand_refresh = Window_MenuCommand.prototype.refresh;
    DW_Command_Window.prototype.refresh = function() {
        if (!this._title) {
            return;
        }

        if ($gameSwitches.value(81)) {
            this.contents.textColor = '#b53120';
            this._title.bitmap.textColor = '#b53120';
        } else if ($gameActors.actor(1).hasLowHp()) {
            this.contents.textColor = '#f27a6a';
            this._title.bitmap.textColor = '#f27a6a';
        } else {
            this.contents.textColor = '#ffffff';
            this._title.bitmap.textColor = '#ffffff';
        }

        refreshTitle(this._title, this._titleName);
        
        _Window_MenuCommand_refresh.call(this);
    };

    /**
     * Resize the text items in the command window
     */
    var Window_Command_drawItem = Window_Command.prototype.drawItem;
    DW_Command_Window.prototype.drawItem = function(index) {
        if ($gameSwitches.value(81)) {
            this.contents.textColor = '#b53120';
        } else if ($gameActors.actor(1).hasLowHp()) {
            this.contents.textColor = '#f27a6a';
        } else {
            this.contents.textColor = '#ffffff';
        }

        this.contents.fontSize = 24;
        var rect = this.itemRectForText(index);
        var align = this.itemTextAlign();
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawText(this.commandName(index), rect.x + (baseWidth() * .25), rect.y + (baseWidth() * .25), rect.width, align);
    }

    DW_Command_Window.prototype._refreshCursor = function() {
        var sx = 0;
        var sy = 0;
        var p = 24;
        this._windowCursorSprite.bitmap = ImageManager.loadSystem('Cursor');;
        this._windowCursorSprite.anchor.x = 0.5;
        this._windowCursorSprite.anchor.y = 1;
        this._windowCursorSprite.move(this._width / 2, this._height);
        this._windowCursorSprite.setFrame(sx, sy, p, p);
        this._windowCursorSprite.alpha = 1;
    };

    DW_Command_Window.prototype._updateCursor = function() {
        if (this.isCursorVisible()) {
            var rect = this.itemRect(this.index());
            this.setCursorRect(rect.x + 28, rect.y + rect.height + 16, (baseWidth() / 2), (baseWidth() / 2));
        } else {
            this.setCursorRect(0, 0, 0, 0);
        }

        var sprite = this._windowCursorSprite;
        var x = Math.floor(this._animationCount / 16) % 2;
        var y = Math.floor(this._animationCount / 16 / 2) % 2;
        var sx = 0;
        var sy = 0;
        var p = 24;
        this._windowCursorSprite.move(this._cursorRect.x, this._cursorRect.y);
        sprite.setFrame(sx+x*p, sy+y*p, p, p);

        if (!this.active) {
            sprite.visible = false;
        } else {
            sprite.visible = this.isOpen();
        }
    };

    DW_Command_Window.prototype.showWindow = function() {
        this.refresh();
        $gamePlayer._vehicleGettingOn = true;
        $gamePlayer.setStepAnime(false);
        $gameMap.events().forEach(function(event) {
            event.setStepAnime(false);
            event.setWalkAnime(false);
            event.lock();
        });
        this.show();
        this.activate();
        this.select(0);
    }

    DW_Command_Window.prototype.hideWindow = function() {
        $gamePlayer._vehicleGettingOn = false;
        $gamePlayer.setStepAnime(true);
        $gameMap.events().forEach(function(event) {
            event.setStepAnime(true);
            event.setWalkAnime(true);
            event.unlock();
        });
        this.hide();
        this.select(0);
        this.deactivate();
    }

    DW_Command_Window.prototype.maxCols = function() {
        return 2;
    };

    DW_Command_Window.prototype.lineHeight = function() {
        return baseWidth();
    };

    DW_Command_Window.prototype.textPadding = function() {
        return baseWidth() / 2.5;
    };

    DW_Command_Window.prototype.onTalk = function() {
        var eventId,
            searchParam = 1;
            direction = $gamePlayer.direction();
            regionId = $gameMap.regionId($gamePlayer.x, $gamePlayer.y);

        // If a merchant is behind a store then increase event search range
        if (regionId === 1) {
            searchParam += 1;
        }

        if (direction === 2) { // facing down
            eventId = $gameMap.eventIdXy($gamePlayer.x, $gamePlayer.y + searchParam);
        } else if (direction === 4) { // facing left
            eventId = $gameMap.eventIdXy($gamePlayer.x - searchParam, $gamePlayer.y);
        } else if (direction === 6) { // facing right
            eventId = $gameMap.eventIdXy($gamePlayer.x + searchParam, $gamePlayer.y);
        } else if (direction === 8) { // facing up
            eventId = $gameMap.eventIdXy($gamePlayer.x, $gamePlayer.y - searchParam);
        }

        if (eventId !== 0) {
            var event = $gameMap.event(eventId);

            if (event.page().image.tileId === 0) {
                event.turnTowardPlayer();
                return event.start();
            } else if (event.page().image.tileId === 1) {
                return event.start();
            }
        }

        $gameMessage.add("`'There is no one there.'");
    }

    DW_Command_Window.prototype.onSpell = function() {
        if (SceneManager._scene._dwSpellWindow._list.length !== 0) {
            SceneManager._scene._dwSpellWindow.showWindow();
        } else {
            $gameMessage.add('`' + $gameActors.actor(1).name() + " cannot yet use the spell.");
        }
    }

    DW_Command_Window.prototype.onStatus = function() {
        SceneManager._scene._dwMainStatusWindow.showWindow();
    }

    DW_Command_Window.prototype.onItem = function() {
        var items = $gameParty.items();

        if (items.length !== 0) {
            SceneManager._scene._messageWindow._dwItemWindow.showWindow();
        } else {
            $gameMessage.add("`Nothing of use has yet been given to thee.");
        }
    }

    DW_Command_Window.prototype.onDoor = function() {
        return onDoor();
    }

    function onDoor() {
        var eventId,
        direction = $gamePlayer.direction();

        if (direction === 2) { // facing down
            eventId = $gameMap.eventIdXy($gamePlayer.x, $gamePlayer.y + 1);
        } else if (direction === 4) { // facing left
            eventId = $gameMap.eventIdXy($gamePlayer.x - 1, $gamePlayer.y);
        } else if (direction === 6) { // facing right
            eventId = $gameMap.eventIdXy($gamePlayer.x + 1, $gamePlayer.y);
        } else if (direction === 8) { // facing up
            eventId = $gameMap.eventIdXy($gamePlayer.x, $gamePlayer.y - 1);
        }

        if (eventId !== 0) {
            var event = $gameMap.event(eventId);

            if(event.page().image.tileId === 17) {
                SceneManager._scene._dwCommandWindow.hideWindow();
                return event.start();
            }
        }

        $gameMessage.add("`There is no door here.");
    }

    DW_Command_Window.prototype.onStairs = function() {
        var eventId = $gameMap.eventIdXy($gamePlayer.x, $gamePlayer.y);
        if (eventId !== 0) {
            var event = $gameMap.event(eventId);

            if(event.page().image.tileId === 16 ||
               event.page().image.tileId === 8 ||
               event.page().image.tileId === 7) {
                this.hideWindow();
                AudioManager.playSe({ name: '29-Dragon-Quest-1-Stairs-Up', volume: 90, pitch: 100, pan: 0});
                return event.start();
            }
        }

        $gameMessage.add("`'There are no stairs here.'");
    }

    DW_Command_Window.prototype.onSearch = function() {
        executeCommonEvent(commonEventList(2));
    }

    DW_Command_Window.prototype.onTake = function() {
        var eventId = $gameMap.eventIdXy($gamePlayer.x, $gamePlayer.y);
        if (eventId !== 0) {
            var event = $gameMap.event(eventId);

            if(event.page().image.tileId === 18) {
                return event.start();
            }
        }

        $gameMessage.add('`There is nothing to take here, ' + $gameActors.actor(1).name() + '.');
    }

    DW_Command_Window.prototype.windowWidth = function() {
        return baseWidth() * 8;
    }

    DW_Command_Window.prototype.windowHeight = function() {
        return baseHeight() * 5;
    }

    /**
     * DW Main Status window that is selected from the command window.
     * It shows name, strength, agility, hp, mp, attack, defense,
     * weapon, armor and shield
     */
    function DW_Main_Status_Window() {
        this.initialize.apply(this, arguments);
    }

    
    DW_Main_Status_Window.prototype = Object.create(Window_Base.prototype);
    DW_Main_Status_Window.prototype.constructor = DW_Main_Status_Window;

    DW_Main_Status_Window.prototype.initialize = function(x, y) {
        Window_Base.prototype.initialize.call(this, x, y, this.windowWidth(), this.windowHeight());
        this.contents.fontSize = 22;
        this.hide();
    }

    DW_Main_Status_Window.prototype.refresh = function() {
        var hero = $gameActors.actor(1);
        var weapon = hero.getDWWeapon() || { name: '' };
        var armor = hero.getDWArmor() || { name: '' };
        var shield = hero.getDWShield() || { name: '' };

        var weaponName = weapon.name.split(' ');
        var armorName = armor.name.split(' ');
        var shieldName = shield.name.split(' ');

        this.contents.clear();

        if ($gameSwitches.value(81)) {
            this.contents.textColor = '#b53120';
        } else if (hero.hasLowHp()) {
            this.contents.textColor = '#f27a6a';
        } else {
            this.contents.textColor = '#ffffff';
        }

        var baseAttack = hero.atk
        var attackModifiers = hero.weaponsModifier();
        var attack = baseAttack + attackModifiers;

        var baseDefense = hero.def;
        var armorModifier = hero.armorsModifier();
        var defense = baseDefense + armorModifier;

        // Name
        this.drawText('NAME:', 0, 0, baseWidth() * 4.5, 'right');
        this.drawText(hero.name(), baseWidth() * 4.5, 0, baseWidth() * 5, 'left');
        
        // Strength
        this.drawText('STRENGTH:', 0, 43, baseWidth() * 7, 'right');
        this.drawText(hero.atk, baseWidth() * 7, 43, baseWidth() * 2, 'right');

        // Agility
        this.drawText('AGILITY:', 0, 43 * 2, baseWidth() * 7, 'right');
        this.drawText(hero.agi, baseWidth() * 7, 43 * 2, baseWidth() * 2, 'right');

        // HP
        this.drawText('MAXIMUM HP:', 0, 43 * 3, baseWidth() * 7, 'right');
        this.drawText(hero.mhp, baseWidth() * 7, 43 * 3, baseWidth() * 2, 'right');

        // MP
        this.drawText('MAXIMUM MP:', 0, 43 * 4, baseWidth() * 7, 'right');
        this.drawText(hero.mmp, baseWidth() * 7, 43 * 4, baseWidth() * 2, 'right');

        // Attack
        this.drawText('ATTACK POWER:', 0, 43 * 5, baseWidth() * 7, 'right');
        this.drawText(attack, baseWidth() * 7, 43 * 5, baseWidth() * 2, 'right');

        // Defense
        this.drawText('DEFENSE POWER:', 0, 43 * 6, baseWidth() * 7, 'right');
        this.drawText(defense, baseWidth() * 7, 43 * 6, baseWidth() * 2, 'right');

        // Weapon
        this.drawText('WEAPON:', 0, 43 * 7, baseWidth() * 4.5, 'right');
        this.drawText(weaponName[0], baseWidth() * 4.5, 43 * 7, baseWidth() * 5, 'left');

        if (weaponName.length > 1) {
            this.drawText(weaponName[1], baseWidth() * 4.95, 43 * 7.5, baseWidth() * 5, 'left');
        } else {
            this.drawText(' ', baseWidth() * 4.95, 43 * 7.5, baseWidth() * 5, 'left');
        }

        // Armor
        this.drawText('ARMOR:', 0, 43 * 8, baseWidth() * 4.5, 'right');
        this.drawText(armorName[0], baseWidth() * 4.5, 43 * 8, baseWidth() * 5, 'left');

        if (armorName.length > 1) {
            this.drawText(armorName[1], baseWidth() * 4.95, 43 * 8.5, baseWidth() * 5, 'left');
        } else {
            this.drawText(' ', baseWidth() * 4.95, 43 * 8.5, baseWidth() * 5, 'left');
        }

        // Shield
        this.drawText('SHIELD:', 0, 43 * 9, baseWidth() * 4.5, 'right');
        this.drawText(shieldName[0], baseWidth() * 4.5, 43 * 9, baseWidth() * 5, 'left');

        if (shieldName.length > 1) {
            this.drawText(shieldName[1], baseWidth() * 4.95, 43 * 9.5, baseWidth() * 5, 'left');
        } else {
            this.drawText(' ', baseWidth() * 4.95, 43 * 9.5, baseWidth() * 5, 'left');
        }
    }

    DW_Main_Status_Window.prototype.showWindow = function() {
        this.refresh();
        this.show();
    }

    DW_Main_Status_Window.prototype.windowWidth = function() {
        return baseWidth() * 10;
    }

    DW_Main_Status_Window.prototype.windowHeight = function() {
        return baseWidth() * 10;
    }


    /**
     * DW Spell window that is selected from the command window.
     * It lists the spells that the user has achived.
     */
    function DW_Spell_Window() {
        this.initialize.apply(this, arguments);
    }

    DW_Spell_Window.prototype = Object.create(Window_MenuCommand.prototype);
    DW_Spell_Window.prototype.constructor = DW_Spell_Window;

    var Window_MenuCommand_initialize = Window_MenuCommand.prototype.initialize;
    DW_Spell_Window.prototype.initialize = function(x, y) {
        Window_MenuCommand_initialize.call(this, x, y);
        this.createTitle();
        this.setHandler('spell', this.onCastSpell.bind(this));
        this.setHandler('cancel', this.onCastSpellCancel.bind(this));
        this.deactivate();
        this.hide();
    }

    DW_Spell_Window.prototype.createTitle = function() {
        var titleName = 'SPELL';
        var title = new Sprite();
        title.bitmap = new Bitmap(22 * 5, 22);
        title.bitmap.fontSize = 22;
        title.bitmap.fillRect(0, 0, 22 * 5, 28, '#000000');
        title.bitmap.drawText(titleName, 0, 0, 22 * 5, 28, 'left');
        title.x = this.width / 2 - title.width / 2;

        this._titleName = titleName;
        this._title = title;
        this.addChild(title);
    }

    DW_Spell_Window.prototype.makeCommandList = function() {
        var enabled = this.areMainCommandsEnabled();
        var that = this;
        $gameActors.actor(1).skills().forEach(function(skill) {
            that.addCommand(skill.name.toUpperCase(), 'spell', enabled, { spell: skill });
        });        
    };

    var _Window_MenuCommand_refresh = Window_MenuCommand.prototype.refresh;
    DW_Spell_Window.prototype.refresh = function() {
        if (!this._title) {
            return;
        }

        if ($gameSwitches.value(81)) {
            this.contents.textColor = '#b53120';
            this._title.bitmap.textColor = '#b53120';
        } else if ($gameActors.actor(1).hasLowHp()) {
            this.contents.textColor = '#f27a6a';
            this._title.bitmap.textColor = '#f27a6a';
        } else {
            this.contents.textColor = '#ffffff';
            this._title.bitmap.textColor = '#ffffff';
        }

        refreshTitle(this._title, this._titleName);

        this.clearCommandList();
        this.makeCommandList();
        this.height = this.windowHeight();
        _Window_MenuCommand_refresh.call(this);
    };

    /**
     * Resize the text items in the command window
     */
    var Window_Command_drawItem = Window_Command.prototype.drawItem;
    DW_Spell_Window.prototype.drawItem = function(index) {
        if ($gameSwitches.value(81)) {
            this.contents.textColor = '#b53120';
        } else if ($gameActors.actor(1).hasLowHp()) {
            this.contents.textColor = '#f27a6a';
        } else {
            this.contents.textColor = '#ffffff';
        }

        this.contents.fontSize = 24;
        var rect = this.itemRectForText(index);
        var align = this.itemTextAlign();
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawText(this.commandName(index), rect.x + (baseWidth() * .25), rect.y + (baseWidth() * .25), rect.width, align);
    }

    DW_Spell_Window.prototype._refreshCursor = function() {
        var sx = 0;
        var sy = 0;
        var p = 24;
        this._windowCursorSprite.bitmap = ImageManager.loadSystem('Cursor');;
        this._windowCursorSprite.anchor.x = 0.5;
        this._windowCursorSprite.anchor.y = 1;
        this._windowCursorSprite.move(this._width / 2, this._height);
        this._windowCursorSprite.setFrame(sx, sy, p, p);
        this._windowCursorSprite.alpha = 1;
    };

    DW_Spell_Window.prototype._updateCursor = function() {
        if (this.isCursorVisible()) {
            var rect = this.itemRect(this.index());
            this.setCursorRect(rect.x + 28, rect.y + rect.height + 16, (baseWidth() / 2), (baseWidth() / 2));
        } else {
            this.setCursorRect(0, 0, 0, 0);
        }

        var sprite = this._windowCursorSprite;
        var x = Math.floor(this._animationCount / 16) % 2;
        var y = Math.floor(this._animationCount / 16 / 2) % 2;
        var sx = 0;
        var sy = 0;
        var p = 24;
        this._windowCursorSprite.move(this._cursorRect.x, this._cursorRect.y);
        sprite.setFrame(sx+x*p, sy+y*p, p, p);
        sprite.visible = this.isOpen();
    };

    DW_Spell_Window.prototype.showWindow = function() {
        this.refresh();
        this.activate();
        this.show();
    }

    DW_Spell_Window.prototype.hideWindow = function() {
        this.hide();
        this.select(0);
        this.deactivate();
    }

    DW_Spell_Window.prototype.maxCols = function() {
        return 1;
    };

    DW_Spell_Window.prototype.maxRows = function() {
        return this.maxItems();
    };

    DW_Spell_Window.prototype.lineHeight = function() {
        return baseWidth();
    };

    DW_Spell_Window.prototype.textPadding = function() {
        return baseWidth() / 2.5;
    };

    DW_Spell_Window.prototype.onCastSpell = function(a) {
        var spell = this._list[this._index];
        var spellObj = spell.ext.spell;

        var hero = $gameActors.actor(1);
        if (!$gameParty.inBattle()) {
            if (hero.mp >= spellObj.mpCost) {
                var spellName = spell.name;
                $gameVariables.setValue(11, spellName);
                $gameVariables.setValue(12, spellObj.id);
                $gameVariables.setValue(13, spellObj.occasion);
                $gameVariables.setValue(14, spellObj);
                executeCommonEvent(commonEventList(3));
            } else {
                $gameMessage.add("`Thy MP is too low.");
            }
        } else {
            if (hero.mp >= spellObj.mpCost) {
                BattleManager.selectNextCommand();
                var action = BattleManager.inputtingAction();
                action.setSkill(spellObj.id);
                BattleManager.actor().setLastBattleSkill(spellObj);
                BattleManager.inputtingAction().setTarget(0);
                BattleManager.selectNextCommand();
                SceneManager._scene.endCommandSelection();
            } else {
                $gameMessage.add("`Thy MP is too low.");
            }
        }

        this.hideWindow();
    }

    DW_Spell_Window.prototype.onCastSpellCancel = function() {
        this.hideWindow();
        SceneManager._scene._dwCommandWindow.hideWindow();
    }

    DW_Spell_Window.prototype.windowWidth = function() {
        return baseWidth() * 6;
    }

    DW_Spell_Window.prototype.windowHeight = function() {
        return (baseHeight() * this._list.length) + 40;
    }

    DW_Spell_Window.prototype.maxPageRows = function() {
        return 10;
    };

    DW_Spell_Window.prototype.maxPageItems = function() {
        return 10;
    };

    function baseWidth() {
        return 48;
    }

    function baseHeight() {
        return 48;
    }

    /**
     * DW Item window that is selected from the command window.
     * It show's the items the user has obtained
     */
    function DW_Item_Window() {
        this.initialize.apply(this, arguments);
    }

    DW_Item_Window.prototype = Object.create(Window_MenuCommand.prototype);
    DW_Item_Window.prototype.constructor = DW_Item_Window;

    var Window_MenuCommand_initialize = Window_MenuCommand.prototype.initialize;
    DW_Item_Window.prototype.initialize = function(x, y, messageWindow) {
        Window_MenuCommand_initialize.call(this, x, y);
        this._messageWindow = messageWindow;
        this.setHandler('item', this.onUseItem.bind(this));
        this.setHandler('cancel', this.onCancelUseItem.bind(this));
        this.deactivate();
        this.hide();
    }

    DW_Item_Window.prototype.makeCommandList = function() {
        var enabled = this.areMainCommandsEnabled();
        var that = this;
        var items = $gameParty.items()
            .map(function(item) {
                if (item.id === 6 || item.id === 7) {
                    item.count = $gameParty.numItems(item);
                }

                return item;
            })
            .reduce(function(previous, current) {
                if (current.id === 6 || current.id === 7) { // Count Herb and Keys at 1 item
                    previous.push(current);
                } else {
                    for (var index = 0; index < $gameParty.numItems(current); index++) {
                        previous.push(current);
                    }    
                }

                return previous;
            }, []);
        
        items.forEach(function(item) {
            that.addCommand(item.name, 'item', enabled, { item: item, count: item.count });
        });        
    };

    DW_Item_Window.prototype.refresh = function() {
        if ($gameSwitches.value(81)) {
            this.contents.textColor = '#b53120';
        } else if ($gameActors.actor(1).hasLowHp()) {
            this.contents.textColor = '#f27a6a';
        } else {
            this.contents.textColor = '#ffffff';
        }

        this.clearCommandList();
        this.makeCommandList();
        this.height = this.windowHeight();
        _Window_MenuCommand_refresh.call(this);
    };

    /**
     * Resize the text items in the command window
     */
    var Window_Command_drawItem = Window_Command.prototype.drawItem;
    DW_Item_Window.prototype.drawItem = function(index) {
        if ($gameSwitches.value(81)) {
            this.contents.textColor = '#b53120';
        } else if ($gameActors.actor(1).hasLowHp()) {
            this.contents.textColor = '#f27a6a';
        } else {
            this.contents.textColor = '#ffffff';
        }

        this.contents.fontSize = 24;
        var rect = this.itemRectForText(index);
        var align = this.itemTextAlign();
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        var item = this._list[index];
        var nameSplit = item.name.split(' ');

        if (nameSplit.length === 1) {
            this.drawText(nameSplit[0], rect.x + (baseWidth() * 0.25), rect.y, rect.width - (baseWidth()), 'left');
            this.drawText(' ', rect.x + (baseWidth() * 0.25), (rect.y + (baseWidth() * 0.5)) + 3, rect.width, 'left');    
        } else if (nameSplit.length === 3) { // For Stones of Sunlight
            this.drawText(nameSplit[0] + ' ' + nameSplit[1], rect.x + (baseWidth() * 0.25), rect.y, rect.width, 'left');
            this.drawText(nameSplit[2], rect.x + (baseWidth() * 0.75), (rect.y + (baseWidth() * 0.5)) + 3, rect.width, 'left');    
        } else {
            this.drawText(nameSplit[0], rect.x + (baseWidth() * 0.25), rect.y, rect.width - (baseWidth() * 0.25), 'left');
            this.drawText(nameSplit[1], rect.x + (baseWidth() * 0.75), (rect.y + (baseWidth() * 0.5)) + 3, rect.width, 'left');
        }

        if (item.ext.count) {
            this.drawText(item.ext.count, rect.width, rect.y, 40, 'right');
        }
    }

    DW_Item_Window.prototype._refreshCursor = function() {
        var sx = 0;
        var sy = 0;
        var p = 24;
        this._windowCursorSprite.bitmap = ImageManager.loadSystem('Cursor');;
        this._windowCursorSprite.anchor.x = 0.5;
        this._windowCursorSprite.anchor.y = 1;
        this._windowCursorSprite.move(this._width / 2, this._height);
        this._windowCursorSprite.setFrame(sx, sy, p, p);
        this._windowCursorSprite.alpha = 1;
    };

    DW_Item_Window.prototype._updateCursor = function() {
        if (this.isCursorVisible()) {
            var rect = this.itemRect(this.index());
            this.setCursorRect(rect.x + 28, rect.y + rect.height + 4, (baseWidth() / 2), (baseWidth() / 2));
        } else {
            this.setCursorRect(0, 0, 0, 0);
        }

        var sprite = this._windowCursorSprite;
        var x = Math.floor(this._animationCount / 16) % 2;
        var y = Math.floor(this._animationCount / 16 / 2) % 2;
        var sx = 0;
        var sy = 0;
        var p = 24;
        this._windowCursorSprite.move(this._cursorRect.x, this._cursorRect.y);
        sprite.setFrame(sx+x*p, sy+y*p, p, p);
        sprite.visible = this.isOpen();
    };

    DW_Item_Window.prototype.showWindow = function() {
        this.refresh();
        this.activate();
        this.show();
    }

    DW_Item_Window.prototype.hideWindow = function() {
        this.hide();
        this.select(0);
        this.deactivate();
    }

    DW_Item_Window.prototype.maxCols = function() {
        return 1;
    };

    DW_Item_Window.prototype.maxRows = function() {
        return this.maxItems();
    };

    DW_Item_Window.prototype.lineHeight = function() {
        return baseWidth() + 7;
    };

    DW_Item_Window.prototype.textPadding = function() {
        return baseWidth() / 2.5;
    };

    DW_Item_Window.prototype.onUseItem = function() {
        var item = this._list[this._index];
        var itemObj = item.ext.item;
        var name = item.name;
        var id = itemObj.id;

        // Selling an item
        if($gameSwitches.value(5)) {
            var price = item.ext.item.price;
            var sellPrice = Math.floor(price / 2);
            $gameSwitches.setValue(5, false);
            $gameMessage.clear();
            this.hideWindow();

            $gameTemp.itemForSell = { item: item.ext.item, price: sellPrice };
            $gameVariables.setValue(4, name);
            $gameVariables.setValue(5, sellPrice);
        } else { // Using an item
            if (!$gameParty.inBattle()) {
                SceneManager._scene._dwCommandWindow.deactivate();
                SceneManager._scene._dwCommandWindow._windowCursorSprite.visible = false;
                this.hideWindow();    
            } else {
                SceneManager._scene._dwCommandWindow.hideWindow();
                this.hideWindow();    
            }

            switch (id) {
                case 1: // Dragon's Scale - Allowed to use during battle
                    if ($gameParty.inBattle()) {
                        useItem(itemObj);
                    } else {
                        executeCommonEvent(commonEventList(28)); // Put on Dragon's Scale
                    }
                    break;
                case 2: // Cursed Belt - Allowed to use during battle
                    if ($gameParty.inBattle()) {
                        useItem(itemObj);
                    } else {
                        executeCommonEvent(commonEventList(30)); // Put on Cursed Belt
                    }
                    break;
                case 3: // Cursed Necklace - Allowed to use during battle
                    if ($gameParty.inBattle()) {
                        useItem(itemObj);
                    } else {
                        executeCommonEvent(commonEventList(31)); // Put on Cursed Necklace
                    }
                    break;
                case 4: // Fairly Water - Can't be used in battle
                    if ($gameParty.inBattle()) {
                        cannotUseInBattle();
                    } else {
                        executeCommonEvent(commonEventList(33)); // Sprinkle Fairy Water
                    }
                    
                    break;
                case 5: // Fighter's Ring - Allowed to use during battle
                    if ($gameParty.inBattle()) {
                        useItem(itemObj);
                    } else {
                        executeCommonEvent(commonEventList(29)); // Put on Fighter's Ring
                    }
                    break;
                case 6: // Herbs - Allowed to use during battle
                    useItem(itemObj);
                    break;
                case 7: // Magic Key - Can't be used in battle
                    if ($gameParty.inBattle()) {
                        cannotUseInBattle();
                    } else {
                        onDoor();
                    }
                    break;
                case 8: // Torch - Can't be used in battle
                    if ($gameParty.inBattle()) {
                        cannotUseInBattle();
                    } else {
                        executeCommonEvent(commonEventList(4)); // Light Torch
                    }
                    break;
                case 9: // Wings - Can't be used in battle
                    if ($gameParty.inBattle()) {
                        cannotUseInBattle();
                    } else {
                        executeCommonEvent(commonEventList(34)); // Use Wings
                    }
                    break;
                case 10: // Ball of light
                    // ? Not sure if it does anything
                    break;
                case 11: // Erdrick's Tablet
                    // Do nothing
                    break;
                case 12: // Erdrick's Token - Can't be used in battle
                    if ($gameParty.inBattle()) {
                        cannotUseInBattle();
                    } else {
                        $gameMessage.add("\\P[1] held the Erdrick's Token tightly.");
                        $gameMessage.add("||`But nothing happened");
                    }
                    break;
                case 13: // Fairy Flute - Allowed to use during battle
                    if ($gameParty.inBattle()) {
                        useItem(itemObj);
                    } else {
                        executeCommonEvent(commonEventList(35)); // Play Fairy Flute
                    }
                    break;
                case 14: // Gwaelin's Love - Can't be used in battle
                    if ($gameParty.inBattle()) {
                        cannotUseInBattle();
                    } else {
                        executeCommonEvent(commonEventList(36)); // Use Gwaelin's Love
                    }
                    break;
                case 15: // Rainbow Drop - Can't be used in battle
                    if ($gameParty.inBattle()) {
                        cannotUseInBattle();
                    } else {
                        executeCommonEvent(commonEventList(37)); // Use Rainbow Drop
                    }
                    break;
                case 16: // Silver Harp - Allowed to use during battle
                         // When used in battle it says `{enemy} looks happy.` after play
                    if ($gameParty.inBattle()) {
                        useItem(itemObj);
                    } else {
                        executeCommonEvent(commonEventList(19)); // Play Harp
                    }
                    break;
                case 17: // Staff of Rain - Can't be used in battle
                    if ($gameParty.inBattle()) {
                        cannotUseInBattle();
                    } else {
                        $gameMessage.add("\\P[1] held the Staff of Rain tightly.");
                        $gameMessage.add("||`But nothing happened");
                    }
                    break;
                case 18: // Stones of Sunlight - Can't be used in battle
                    if ($gameParty.inBattle()) {
                        cannotUseInBattle();
                    } else {
                        $gameMessage.add("\\P[1] held the Stones of Sunlight tightly.");
                        $gameMessage.add("||`But nothing happened");
                    }
                    break;
                default:
                    break;
            }
        }
    }

    DW_Item_Window.prototype.onCancelUseItem = function() {
        if($gameSwitches.value(5)) {
            $gameSwitches.setValue(5, false);
            this._messageWindow.terminateMessage(true);
            this.hideWindow();    
            $gameSwitches.setValue(8, true);
        } else {
            SceneManager._scene._messageWindow.terminateMessage();
            this.hideWindow();
            SceneManager._scene._dwCommandWindow.hideWindow();
        }
    }

    DW_Item_Window.prototype.windowWidth = function() {
        return baseWidth() * 6;
    }

    DW_Item_Window.prototype.windowHeight = function() {
        return (this.lineHeight() * this._list.length) + 55;
    }

    DW_Item_Window.prototype.maxPageRows = function() {
        return 10;
    };

    DW_Item_Window.prototype.maxPageItems = function() {
        return 10;
    };

        /**
     * DW Item window that is selected from the command window.
     * It show's the items the user has obtained
     */
    function DW_Shop_Window() {
        this.initialize.apply(this, arguments);
    }

    DW_Shop_Window.prototype = Object.create(Window_MenuCommand.prototype);
    DW_Shop_Window.prototype.constructor = DW_Shop_Window;

    var Window_MenuCommand_initialize = Window_MenuCommand.prototype.initialize;
    DW_Shop_Window.prototype.initialize = function(x, y, messagewindow) {
        Window_MenuCommand_initialize.call(this, x, y);
        this._messageWindow = messagewindow;
        this.setHandler('shop', this.onPurchase.bind(this));
        this.setHandler('cancel', this.onCancelPurchase.bind(this));
        this.deactivate();
        this.hide();
    }

    DW_Shop_Window.prototype.makeCommandList = function() {
        var enabled = this.areMainCommandsEnabled();
        var that = this;
        $gameTemp.shopItems().forEach(function(item) {
            that.addCommand(item.name, 'shop', enabled, { item: item.item, price: item.price });
        });
    };

    DW_Shop_Window.prototype.refresh = function() {
        if ($gameSwitches.value(81)) {
            this.contents.textColor = '#b53120';
        } else if ($gameActors.actor(1).hasLowHp()) {
            this.contents.textColor = '#f27a6a';
        } else {
            this.contents.textColor = '#ffffff';
        }

        this.clearCommandList();
        this.makeCommandList();
        this.height = this.windowHeight();
        _Window_MenuCommand_refresh.call(this);
    };

    /**
     * Resize the text items in the command window
     */
    var Window_Command_drawItem = Window_Command.prototype.drawItem;
    DW_Shop_Window.prototype.drawItem = function(index) {
        if ($gameSwitches.value(81)) {
            this.contents.textColor = '#b53120';
        } else if ($gameActors.actor(1).hasLowHp()) {
            this.contents.textColor = '#f27a6a';
        } else {
            this.contents.textColor = '#ffffff';
        }
        
        this.contents.fontSize = 24;
        var rect = this.itemRectForText(index);

        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        var item = this._list[index];
        var nameSplit = item.name.split(' ');

        if (nameSplit.length === 1) {
            this.drawText(nameSplit[0], rect.x + (baseWidth() * 0.25), rect.y, rect.width - (baseWidth()), 'left');
            this.drawText(' ', rect.x + (baseWidth() * 0.25), (rect.y + (baseWidth() * 0.5)) + 3, rect.width, 'left');    
        } else {
            this.drawText(nameSplit[0], rect.x + (baseWidth() * 0.25), rect.y, rect.width - (baseWidth() * 0.25), 'left');
            this.drawText(nameSplit[1], rect.x + (baseWidth() * 0.75), (rect.y + (baseWidth() * 0.5)) + 3, rect.width, 'left');
        }

        if (item.ext) {
            this.drawText(item.ext.price, rect.width - (baseWidth() * 2), rect.y + 5, baseWidth() * 2.75, 'right');
        }
    }

    DW_Shop_Window.prototype._refreshCursor = function() {
        var sx = 0;
        var sy = 0;
        var p = 24;
        this._windowCursorSprite.bitmap = ImageManager.loadSystem('Cursor');;
        this._windowCursorSprite.anchor.x = 0.5;
        this._windowCursorSprite.anchor.y = 1;
        this._windowCursorSprite.move(this._width / 2, this._height);
        this._windowCursorSprite.setFrame(sx, sy, p, p);
        this._windowCursorSprite.alpha = 1;
    };

    DW_Shop_Window.prototype._updateCursor = function() {
        if (this.isCursorVisible()) {
            var rect = this.itemRect(this.index());
            this.setCursorRect(rect.x + 28, rect.y + rect.height + 4, (baseWidth() / 2), (baseWidth() / 2));
        } else {
            this.setCursorRect(0, 0, 0, 0);
        }

        var sprite = this._windowCursorSprite;
        var x = Math.floor(this._animationCount / 16) % 2;
        var y = Math.floor(this._animationCount / 16 / 2) % 2;
        var sx = 0;
        var sy = 0;
        var p = 24;
        this._windowCursorSprite.move(this._cursorRect.x, this._cursorRect.y);
        sprite.setFrame(sx+x*p, sy+y*p, p, p);
        sprite.visible = this.isOpen();
    };

    DW_Shop_Window.prototype.processHandling = function() {
        if (this.isOpenAndActive()) {
            if (this.isOkEnabled() && this.isOkTriggered()) {
                this.processOk();
            } else if (this.isCancelEnabled() && this.isCancelTriggered()) {
                this.processCancel();
            } else if (this.isHandled('pagedown') && Input.isTriggered('pagedown')) {
                this.processPagedown();
            } else if (this.isHandled('pageup') && Input.isTriggered('pageup')) {
                this.processPageup();
            }
        }
    };
    
    DW_Shop_Window.prototype.showWindow = function() {
        this.refresh();
        this.activate();
        this.show();
    }

    DW_Shop_Window.prototype.hideWindow = function() {
        $gameTemp.clearShopItems();
        this.hide();
        this.select(0);
        this.deactivate();
    }

    DW_Shop_Window.prototype.maxCols = function() {
        return 1;
    };

    DW_Shop_Window.prototype.maxRows = function() {
        return this.maxItems();
    };

    DW_Shop_Window.prototype.lineHeight = function() {
        return baseWidth() + 7;
    };

    DW_Shop_Window.prototype.textPadding = function() {
        return baseWidth() / 2.5;
    };


    DW_Shop_Window.prototype.onPurchase = function() {
        var item = this._list[this._index];
        var itemObj = item.ext.item;
        var name = item.name;
        var purchasePrice = item.ext.price;
        this._messageWindow.terminateMessage(true);
        this.hideWindow();

        // Purchasing an item
        if (itemObj.__type === 'item') {

            // Check backpack size
            if((itemObj.id === 6 || itemObj.id === 7) && 
            $gameParty.numItems(itemObj) >= 6) {
                $gameMessage.add("'Thou cannot hold more " + name + ".'");
                return;
            } else if ((itemObj.id !== 6 && itemObj.id !== 7) && 
                    $gameParty.addUpItems() >= 10) {
                $gameMessage.add("'Thou cannot hold more " + name + ".'");
                return;
            }

            // Verify amount of gold
            if ($gameParty.gold() >= purchasePrice) {
                $gameParty.loseGold(purchasePrice);
                $gameParty.gainItem(itemObj, 1, true);

                $gameMessage.add("|'The " + name + "?'");
                $gameMessage.add("|'Thank you very much.'");
            } else {
                $gameMessage.add("|'Thou hast not enough money.'");
            }
        } else {
            
            if ($gameParty.gold() < purchasePrice) {
                $gameMessage.add("'The " + name + "?'\\!");
                $gameMessage.add("||'Thou hast not enough money.'");

                return;
            } else {
                $gameTemp.itemForPurchase = { item: itemObj, price: purchasePrice };
                $gameSwitches.setValue(7, true);
                $gameVariables.setValue(6, name);

                var equipedItem = $gameActors.actor(1).getEquipedItem(itemObj);

                if (equipedItem) {
                    $gameSwitches.setValue(6, true);
                    var sellItemName = equipedItem.name;
                    var sellPrice = Math.floor(equipedItem.price / 2);

                    $gameTemp.itemForSell = { item: equipedItem, price: sellPrice };
                    $gameVariables.setValue(4, sellItemName);
                    $gameVariables.setValue(5, sellPrice);
                }
            }
        }
    }

    Game_Party.prototype.setItemVars = function() {
        var itemId = $gameVariables.value(17);
        var item = $dataItems[itemId];

        $gameVariables.setValue(16, item.name);
        $gameVariables.setValue(18, item);
    }

    Game_Party.prototype.canAddItem = function() {
        var count = 0;
        var itemId = $gameVariables.value(17);
        var item = this.items().find(function(item) { return item.id === itemId });

        /**
         * Note: Herbs and Magic Keys are guaranteed items.  Backpack is considered full
         * if 8 items are placed in it.  In total (with keys and herbs) the backpack
         * will hold 10 items. 
         */
        // If the item is a magic key or herb then count number user has in backpack.
        if (itemId === 6 || itemId === 7) {
            var numofItems = this.numItems(item);

            if (numofItems < 6) {
                return true;
            } else {
                return false;
            }
        } else {
            var backpackCount = this.addUpItems();

            // If backpack is already full then can't add any more
            if (backpackCount >= 8) {
                return false;
            }
        }

        return true;
    }

    Game_Party.prototype.addUpItems = function() {
        var count = 0;
        var that = this;
        this.items().forEach(function(item) {
            if (item.id === 6 || item.id === 7) {
                count += 1;
            } else {
                count += that.numItems(item);
            }
        });
        return count;
    }

    DW_Shop_Window.prototype.onCancelPurchase = function() {
        SceneManager._scene._messageWindow.terminateMessage();
        this.hideWindow();
        $gameSwitches.setValue(8, true);
    }

    DW_Shop_Window.prototype.windowWidth = function() {
        return baseWidth() * 9;
    }

    DW_Shop_Window.prototype.windowHeight = function() {
        return (this.lineHeight() * this._list.length) + 55;
    }

    DW_Shop_Window.prototype.maxPageRows = function() {
        return 8;
    };

    DW_Shop_Window.prototype.maxPageItems = function() {
        return 8;
    };

    /**
     *  Window_ChoiceList Overrides
     * 
     * 
     * 
     */

    /**
     * Position all choice boxes next to the status box
     */
    var Window_ChoiceList_updatePlacement = Window_ChoiceList.prototype.updatePlacement;
    Window_ChoiceList.prototype.updatePlacement = function() {
        Window_ChoiceList_updatePlacement.call(this);
        this.x = baseWidth() * 5;
        this.y = baseWidth() * 2;
        this.width = baseWidth() * 4;
        this.height = baseWidth() * 2.6;
    };

    Window_ChoiceList.prototype.itemRectForText = function(index) {
        var rect = this.itemRect(index);
        rect.x += this.textPadding();
        rect.width -= this.textPadding() * 2;
        return rect;
    };

    Window_ChoiceList.prototype.drawItem = function(index) {
        this.contents.fontSize = 24;
        var rect = this.itemRectForText(index);
        var align = this.itemTextAlign();
        this.drawText(this.commandName(index), rect.x + (baseWidth() * 0.5), rect.y + (baseWidth() * 0.25), rect.width, align);
    }

    Window_ChoiceList.prototype._refreshCursor = function() {
        var sx = 0;
        var sy = 0;
        var p = 24;
        this._windowCursorSprite.bitmap = ImageManager.loadSystem('Cursor');;
        this._windowCursorSprite.anchor.x = 0.5;
        this._windowCursorSprite.anchor.y = 1;
        this._windowCursorSprite.setFrame(sx, sy, p, p);
        this._windowCursorSprite.alpha = 1;
    };

    Window_ChoiceList.prototype._updateCursor = function() {
        var rect = this.itemRect(this.index());
        if (this.index() !== 0) {
            this.setCursorRect(rect.x + 28, rect.y + rect.height + 20, (baseWidth() / 2), (baseWidth() / 2));
        } else {
            this.setCursorRect(rect.x + 28, rect.y + rect.height + 24, (baseWidth() / 2), (baseWidth() / 2));
        }

        var sprite = this._windowCursorSprite;
        var x = Math.floor(this._animationCount / 16) % 2;
        var y = Math.floor(this._animationCount / 16 / 2) % 2;
        var sx = 0;
        var sy = 0;
        var p = 24;
        this._windowCursorSprite.move(this._cursorRect.x, this._cursorRect.y);
        sprite.setFrame(sx+x*p, sy+y*p, p, p);
        sprite.visible = this.isOpen();
    };

    Window_ChoiceList.prototype.lineHeight = function() {
        return 42;
    };

    /**
     * Override to locking a event will now turn it toward the player.
     */
    Game_Event.prototype.lock = function() {
        if (!this._locked) {
            this._prelockDirection = this.direction();
            this._locked = true;
        }
    };

    var _Game_Enemy_initialize = Game_Enemy.prototype.initialize;
    Game_Enemy.prototype.initialize = function(enemyId, x, y) {
        _Game_Enemy_initialize.call(this, enemyId, x, y);
        this._data = JSON.parse(this.enemy().note);
        this.setupStats();
    };

    Game_Enemy.prototype.hasLowHp = function() {
        return (this.hp / this.mhp) <= 0.267; // Making it match Hero
    };

    Game_Enemy.prototype.setupStats = function() {
        var hp = $gameSystem.randomNum(this._data.hp, this._data.maxHp);
        this.enemy().params[0] = hp;
        this.enemy().params[1] = 9999;  // enemy never run out
        this.enemy().params[2] = this._data.strength;
        this.enemy().params[3] = this._data.dodge;
        this.enemy().params[4] = this._data.sleepResist;
        this.enemy().params[5] = this._data.stopspellResist;
        this.enemy().params[6] = this._data.agility;
        this.enemy().params[7] = this._data.hurtResist;
    
        var gold = $gameSystem.randomNum(this._data.gp, this._data.maxGp);
        this.enemy().gold = gold;
        this.enemy().exp = this._data.xp;
    
    
        this.recoverAll();    
    };

    /**
     * All player actions should come through the command window
     */
    Game_Player.prototype.triggerButtonAction = function() {
        return false;
    };

    Game_Player.prototype.notRepelled = function(enemyId) {
        var hero = $gameActors.actor(1);
        var heroDef = hero.def;
        var enemyAtk = $dataEnemies[enemyId].params[2]; // Shortcut
        if (hero.hasRepel()) {
            if (heroDef > enemyAtk) {
                return false; // enemy repelled
            } else {
                return true; // enemy not repelled
            }
        } else {
            return true;
        }
    };

    /**
     * Override default behavior to mimic DW1 system
     */
    Window_Selectable.prototype.cursorRight = function(wrap) {
        var index = this.index();
        var maxItems = this.maxItems();
        var maxCols = this.maxCols();
        if (maxCols >= 2 && (index < maxItems - 1 || (wrap && this.isHorizontal()))) {
            if (index % 2 === 0) {
                this.select((index + 1));
            }
        }
    };
    
    Window_Selectable.prototype.cursorLeft = function(wrap) {
        var index = this.index();
        var maxItems = this.maxItems();
        var maxCols = this.maxCols();
        if (maxCols >= 2 && (index > 0 || (wrap && this.isHorizontal()))) {
            if (index % 2 !== 0) {
                this.select((index - 1));
            }
        }
    };

    Game_Temp.prototype.initialize = function() {
        this._isPlaytest = Utils.isOptionValid('test');
        this._commonEventId = 0;
        this._destinationX = null;
        this._destinationY = null;
        this._shopItems = [];
    };

    Game_Temp.prototype.addShopItem = function(type, id, price) {
        var item;
        if (type === 'item') {
            item = $dataItems[id];
        } else if (type === 'armor') {
            item = $dataArmors[id];
        } else if (type === 'weapon') {
            item = $dataWeapons[id];
        }

        item.__type = type; // add dw type to item
        this._shopItems.push( { item: item, name: item.name, price: price || item.price });     

    }

    Game_Temp.prototype.hasShopItem = function() {
        return this._shopItems.length > 0;
    }

    Game_Temp.prototype.clearShopItems = function(id, price) {
        this._shopItems = [];
    }

    Game_Temp.prototype.shopItems = function(id, price) {
        return this._shopItems;
    }

    Game_Actor.prototype.getDWWeapon = function() {
        return this.equips()[0];
    }

    Game_Actor.prototype.getDWShield = function() {
        return this.equips()[1];
    }

    Game_Actor.prototype.getDWArmor = function() {
        return this.equips()[2];
    }

    Game_Actor.prototype.getEquipedItem = function(item) {
        var etypeId = item.etypeId - 1;
        return this.equips()[etypeId];
    }

    Game_Actor.prototype.hasLowHp = function() {
        return ($gameActors.actor(1).hp / $gameActors.actor(1).mhp) <= 0.267;
    }

    Game_Actor.prototype.isAsleep = function() {
        return this._states.find(function(state) { return state === 5 }) ? true : false;
    }

    Game_Actor.prototype.hasRepel = function() {
        return this._states.find(function(state) { return state === 4 }) ? true : false;
    }

    Game_Enemy.prototype.isAsleep = function() {
        return this._states.find(function(state) { return state === 5 }) ? true : false;
    }

    Game_Actor.prototype.hasSpellsBlocked = function() {
        return this._states.find(function(state) { return state === 7 }) ? true : false;
    }

    Game_Actor.prototype.isCursed = function() {
        if (!this._states) {
            return false;
        }

        return this._states.find(function(state) { return state === 6 }) ? true : false;
    }

    Game_Enemy.prototype.hasSpellsBlocked = function() {
        return this._states.find(function(state) { return state === 7 }) ? true : false;
    }

    function commonEventList(commonEventId) {
        var commonEvent = $dataCommonEvents[commonEventId];
        if (!commonEvent) {
            return [];
        }

        return commonEvent.list;
    }
    
    function executeCommonEvent(commonEventList) {
        $gameMap._interpreter.clear();
        $gameMap._interpreter._list = commonEventList;
    }

    /**
     * DW Battle command window that show in the upper right side of screen.  It displays
     * the action command the player can take in a combat scenario
     */
    function DW_Battle_Command_Window() {
        this.initialize.apply(this, arguments);
    }

    DW_Battle_Command_Window.prototype = Object.create(DW_Command_Window.prototype);
    DW_Battle_Command_Window.prototype.constructor = DW_Battle_Command_Window;

    var DW_Command_Window_initialize = DW_Command_Window.prototype.initialize;
    DW_Battle_Command_Window.prototype.initialize = function(x, y, messageWindow) {
        DW_Command_Window_initialize.call(this, x, y, this.windowWidth(), this.windowHeight());
        this.setHandler('fight',   this.onFight.bind(this));
        this.setHandler('spell',  this.onSpell.bind(this));
        this.setHandler('run', this.onRun.bind(this));
        this.setHandler('item',   this.onItem.bind(this));
        this.setHandler('cancel', this.onCancel.bind(this));
        this.deactivate();
        this.hide();
    }

    DW_Battle_Command_Window.prototype.makeCommandList = function() {
        var enabled = this.areMainCommandsEnabled();
        this.addCommand('FIGHT', 'fight', enabled);
        this.addCommand('SPELL', 'spell', enabled);
        this.addCommand('RUN', 'run', enabled);
        this.addCommand('ITEM', 'item', enabled);
    };

    var _DW_Command_Window_drawItem = DW_Command_Window.prototype.drawItem;
    DW_Battle_Command_Window.prototype.drawItem = function(index) {
        if ($gameSwitches.value(81)) {
            contents.bitmap.textColor = '#b53120';
        } else if ($gameActors.actor(1).hasLowHp()) {
            this.contents.textColor = '#f27a6a';
        } else {
            this.contents.textColor = '#ffffff';
        }
        _DW_Command_Window_drawItem.call(this, index);
    }
    
    DW_Battle_Command_Window.prototype.showWindow = function() {
        this.select(0);
        this.refresh();
        if(this.visible) {
            this.activate();
            return;
        }

        this.show();
        this.activate();
        this.select(0);
    }

    DW_Battle_Command_Window.prototype.hideWindow = function() {
        this.select(0);
        this.hide();
        this.deactivate();
    }

    DW_Battle_Command_Window.prototype.onCancel = function() {
        this.select(0);
        this.hideWindow();
    }

    DW_Battle_Command_Window.prototype.onFight = function() {
        BattleManager.selectNextCommand();
        BattleManager.inputtingAction().setAttack();
        var action = BattleManager.inputtingAction().setTarget(0);
        BattleManager.selectNextCommand();
        SceneManager._scene.endCommandSelection();
        this.hideWindow();
    }

    DW_Battle_Command_Window.prototype.onRun = function() {
        this.hideWindow();
        BattleManager.processEscape();
    }

    DW_Battle_Command_Window.prototype.onItem = function() {
        if (SceneManager._scene._dwItemWindow._list.length !== 0) {
            SceneManager._scene._dwItemWindow.showWindow();
        } else {
            $gameMessage.add("Nothing of use has yet been given to thee.");
            SceneManager._scene._dwCommandWindow.deactivate();
        }
    }

    DW_Battle_Command_Window.prototype.onSpell = function() {
        if (SceneManager._scene._dwSpellWindow._list.length !== 0) {
            SceneManager._scene._dwSpellWindow.showWindow();
            SceneManager._scene._dwCommandWindow.deactivate();
        } else {
            $gameMessage.add($gameActors.actor(1).name() + " cannot yet use the spell.");
        }
    }

    DW_Battle_Command_Window.prototype.windowHeight = function() {
        return baseHeight() * 3;
    }

    
    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        if ($gameActors.actor(1).hasLowHp() &&
            this._messageWindow.filters === null ) {
            
            // Need to replace the white with red in the Battle scene background
            this.filters = $gameSystem.redPIXIFilter();

            $gameMap.changeTileset(2);
            this._messageWindow.filters = $gameSystem.redPIXIFilter();
            this._dwStatusWindow.filters = $gameSystem.redPIXIFilter();
            this._dwCommandWindow.filters = $gameSystem.redPIXIFilter();
            this._dwSpellWindow.filters = $gameSystem.redPIXIFilter();
            this._dwItemWindow.filters = $gameSystem.redPIXIFilter();

            this._dwStatusWindow.refresh();
            this._dwCommandWindow.refresh();
            this._dwSpellWindow.refresh();
            this._dwItemWindow.refresh();    
        } else if (!$gameActors.actor(1).hasLowHp() && 
                   this._messageWindow.filters !== null) {

            this.filters = null;

            $gameMap.changeTileset(1);
            this._messageWindow.filters = null;
            this._dwStatusWindow.filters = null;
            this._dwCommandWindow.filters = null;
            this._dwSpellWindow.filters = null;
            this._dwItemWindow.filters = null;    

            this._dwStatusWindow.refresh();
            this._dwCommandWindow.refresh();
            this._dwSpellWindow.refresh();
            this._dwItemWindow.refresh();    
        }

        _Scene_Battle_update.call(this);
    };

    var _DW_Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _DW_Scene_Battle_createAllWindows.call(this);
        this._dwStatusWindow = new DW_Status_Window(baseWidth() * .5, baseHeight() * 2);
        this.addWindow(this._dwStatusWindow);
        this._dwCommandWindow = new DW_Battle_Command_Window(baseWidth() * 6, baseHeight() * 2);
        this.addWindow(this._dwCommandWindow);
        this._dwSpellWindow = new DW_Spell_Window(baseWidth() * 9, baseHeight() * 3);
        this.addWindow(this._dwSpellWindow);
        this._dwItemWindow = new DW_Item_Window(baseWidth() * 10, baseHeight() * 3);
        this.addWindow(this._dwItemWindow);
    };


    function useItem(item) {
        if (!$gameParty.inBattle()) {
            $gameMessage.add('`' + $gameActors.actor(1).name() + " used the " + item.name + '.');
            var actor = $gameActors.actor(1);
            actor.useItem(item);

            var action = new Game_Action(actor);
            action.setItemObject(item);
            action.apply(actor);
            action.applyGlobal();
        } else {
            BattleManager.selectNextCommand();
            var action = BattleManager.inputtingAction();
            action.setItem(item.id);
            
            $gameParty.setLastItem(item);
            BattleManager.selectNextCommand();
            SceneManager._scene.endCommandSelection();
        }
    }

    function cannotUseInBattle() {
        BattleManager._logWindow.push('addText', '|That cannot be used in battle.');
    }

    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     * Using Math.round() will give you a non-uniform distribution!
     */
    Game_System.prototype.randomNum = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    Game_System.prototype.redPIXIFilter = function() {
        return [ redPixiFilter ];
    }

    Game_System.prototype.sideWithDragonlordPixiFilter = function() {
        return [ sideWithDragonlordPixiFilter ];
    }

    /**
     * Hardcoding the experience graph to match DW1
     * @param {*} level 
     */
    Game_Actor.prototype.expForLevel = function(level) {
        switch(level) {
            case 1:
                return 0;
            case 2:
                return 7;
            case 3:
                return 23;
            case 4:
                return 47;
            case 5:
                return 110;
            case 6:
                return 220;
            case 7:
                return 450;
            case 8:
                return 800;
            case 9:
                return 1300;
            case 10:
                return 2000;
            case 11:
                return 2900;
            case 12:
                return 4000;
            case 13:
                return 5500;
            case 14:
                return 7500;
            case 15:
                return 10000;
            case 16:
                return 13000;
            case 17:
                return 16000;
            case 18:
                return 19000;
            case 19:
                return 22000;
            case 20:
                return 26000;
            case 21:
                return 30000;
            case 22:
                return 34000;
            case 23:
                return 38000;
            case 24:
                return 42000;
            case 25:
                return 46000;
            case 26:
                return 50000;
            case 27:
                return 54000;
            case 28:
                return 58000;
            case 29:
                return 62000;
            case 30:
                return 65535;	
        }        
    };

    Game_Actor.prototype.maxLevel = function() {
        return 30; // Max level capped at 30
    };

    Game_BattlerBase.prototype.param = function(paramId) {
        return this.paramBase(paramId);
    };
    
    Game_Actor.prototype.onPlayerWalk = function() {
        this.clearResult();
        this.checkFloorEffect();
        this.checkArmorForHP();
        if ($gamePlayer.isNormal()) {
            this.turnEndOnMap();
            this.states().forEach(function(state) {
                this.updateStateSteps(state);
            }, this);
            this.showAddedStates();
            this.showRemovedStates();
        }
    };

    Game_Actor.prototype.hasMagicArmor = function() {
        var armorId = this.getDWArmor() && this.getDWArmor().id
        return  armorId === 9;
    };

    Game_Actor.prototype.hasErdrickArmor = function() {
        var armorId = this.getDWArmor() && this.getDWArmor().id
        return  armorId === 10;
    };

    Game_Actor.prototype.checkArmorForHP = function() {
        if (this.hasMagicArmor()) {
            this._magicalArmorSteps++;

            if ((this._magicalArmorSteps / 4) % 1 === 0) {
                this.gainHp(1);
            }

        } else if (this.hasErdrickArmor()){
            this.gainHp(1);
        }
    };

    Game_Actor.prototype.checkFloorEffect = function() {
        if ($gameMap.isSwamp($gamePlayer.x, $gamePlayer.y)) {
            this.executeFloorDamage('swamp');
        } else if ($gameMap.isBarrier($gamePlayer.x, $gamePlayer.y)) {
            this.executeFloorDamage('barrier');
        } else if ($gameMap.isHill($gamePlayer.x, $gamePlayer.y)) {
            this.executeFloorDamage('hill');
        }
    };

    Game_Actor.prototype.executeFloorDamage = function(damageType) {
        // TODO: create common event for each damage type
        // 1. Perform damage flash (barrier brighter red)
        // 2. Longer pause when stepping with barrier
        // 3. Different sounds when stepping
        // 4. Trigger death sequence if hp === 0
        if (damageType === 'swamp') {
            this.performSwampDamage();
        } else if (damageType === 'barrier') {
            this.performBarrierDamage();
        } else {
            this.performHillStutter();
        }
    };

    Game_Actor.prototype.performHillStutter = function() {
        executeCommonEvent(commonEventList(43));
    };

    Game_Actor.prototype.performSwampDamage = function() {
        if (!$gameParty.inBattle()) {
            executeCommonEvent(commonEventList(41));
        }
    };

    Game_Actor.prototype.performBarrierDamage = function() {
        if (!$gameParty.inBattle()) {
            executeCommonEvent(commonEventList(42));
        }
    };

    Game_Actor.prototype.isWearingDragonScale = function() {
        var dragonScale = this.states().find(function (state) { return state.id === 2 });
        return dragonScale !== undefined;
    };

    Game_Actor.prototype.isWearingFightersRing = function() {
        var fightersRing = this.states().find(function (state) { return state.id === 3 });
        return fightersRing !== undefined;
    };

    Game_Actor.prototype.isWearingCursedBelt = function() {
        var cursedBelt = this.states().find(function (state) { return state.id === 8 });
        return cursedBelt !== undefined;
    };

    Game_Map.prototype.isHill = function(x, y) {
        return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x80);
    };

    Game_Map.prototype.isBarrier = function(x, y) {
        return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x100);
    };

    Game_Map.prototype.isSwamp = function(x, y) {
        return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x40);
    };

    function refreshTitle(title, name) {
        title.bitmap.fillRect(0, 0, title.width, 28, '#000000');
        title.bitmap.drawText(name, 0, 0, title.width, 28, 'left');
    }

    // TODO: Fairy Water has the exact same effect.
    // https://gamefaqs.gamespot.com/nes/563408-dragon-warrior/faqs/55534
})();

// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
    // 1. Let O be ? ToObject(this value).
        if (this == null) {
        throw new TypeError('"this" is null or not defined');
        }

        var o = Object(this);

        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = o.length >>> 0;

        // 3. If IsCallable(predicate) is false, throw a TypeError exception.
        if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
        }

        // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
        var thisArg = arguments[1];

        // 5. Let k be 0.
        var k = 0;

        // 6. Repeat, while k < len
        while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
            return kValue;
        }
        // e. Increase k by 1.
        k++;
        }

        // 7. Return undefined.
        return undefined;
    },
    configurable: true,
    writable: true
    });
}