import { Vector2 as Vec2, V2, Rect, RECT } from '../types.js';
import { TButton } from './tbutton.js';
import { TTitlebar } from './ttitlebar.js';
import { TCustomWindow } from './tcustomWindow.js';

export class TWindow extends TCustomWindow {
    constructor(o) {        
        super(o);

        this.isMovable     = true;
        this.isWindow      = true;        
        this.edges         = this.ui.surface.rect;                                                                              // the window cannot be moved outside of this area
        this._opacityChangeSpeed = 0.05;        
        this.type          = 'normal';
        
        if (!o.noTitlebar) {                                    
            this.titlebar = this.add(TTitlebar, { caption:o.caption, size:V2(this.size.x, 0), useDefaults:this.ui.defaults.window.titlebar });                                // window title bar            
            this.titlebar.hoverCursor = 'default';
            if (!o.noCloseButton) {
                this.btClose = this.titlebar.add(TButton, { caption:'✖', position:V2(this.size.x - 32, 4), size:V2(24, 24) });
                this.btClose.onMouseUp = e => { this.close() }
            }
        }

        this.fetchDefaults('window'); 

        if ('settings' in o) this.ui.applyProps(this.settings, o.settings);

        // override default settings:        
        if (o.settings?.titlebar)    this.ui.applyProps(this.titlebar.settings, o.settings.titlebar);                             // overwrite titleBar's settings with parameter settings.titlebar  
        if (o.settings?.closeButton) this.ui.applyProps(this.btClose.settings, o.settings.closeButton);                           // overwrite closeButton's settings with parameter settings.closeButton

        // apply titlebar height from the settings:
        if (this.titlebar) {
            if ('height' in this.titlebar.settings) this.titlebar.size.y = this.titlebar.settings.height;        
        }
    }
}