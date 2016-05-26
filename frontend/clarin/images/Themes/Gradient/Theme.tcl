global GUI_Options HomeDir PANE tcl_platform
array set GUI_Options {ToolbarFrameRelief raised ToolbarFrameReliefBorderWidth 1
  ToolbarRelief groove ToolbarReliefBorderWidth 0 ToolbarHandleRelief flat 
  ToolbarHandleReliefBorderWidth 0 ToolbarDecorate 0 ToolbarImageHandle 1
  ToolbarHandleBackground #666699 ToolbarBackground #cccccc
}
set GUI_Options(GUI_Theme) Gradient
if {![info exists DoNotLoadImages]} {
  foreach file [glob $HomeDir/share/Themes/Gradient/*.gif] {
    set image [file root [file tail $file]]
    puts "Reloading Image: $file"
    if {[catch {image create photo $image -file \
      [file join $HomeDir share Themes Gradient $image.gif]}]} {
      GUI_LoadImage $image
    }
  }
  catch {image create photo IToolbar -file \
      [file join $HomeDir share Themes Gradient IToolbar.gif]}
  catch {image create photo IToolbarVertical -file \
      [file join $HomeDir share Themes Gradient IToolbarVertical.gif]}
  GUI_LoadImage IToolbar
  GUI_LoadImage IToolbarVertical
}

## Pane Options...
array set PANE {BorderWidth 1 Color #808080}
set GUI_Options(ExplorerPaneWidth) 8

## Default Background
option add *Background          #A0A0A0
option add *highlightBackground #A0A0A0
option add *activeForeground    #BBBAED
option add *activeBackground    #666699
option add *selectColor         #FFFF00

## (BWidget) ArrowButton Widget Section
option add *ArrowButton.foreground       #000000
option add *ArrowButton.background       #808080
option add *ArrowButton.activeForeground #BBBAED
option add *ArrowButton.activeBackground #666699
option add *ArrowButton*HighlightColor   #808080

## Button Widget Section
option add *Button.Foreground       #000000
option add *Button.Background       #808080
option add *Button.activeForeground #BBBAED
option add *Button.activeBackground #666699

## Canvas Widget Section
option add *Canvas.Background #EEEEEE

## CheckButton Widget Section
option add *Checkbutton.selectColor yellow

## BWidget's ComboBox Section
option add *ComboBox.background #A0A0A0

## Entry Widget Section
option add *Entry.Foreground  #666699
option add *Entry.Background  #FFFFFF
option add *Entry.selectForeground #BBBAED
option add *Entry.selectBackground #666699
array set GUI_Options {InputForeground #666699 InputBackground #FFFFFF SelectForeground #FFFFFF SelectBackground #666699}

## Explorer Widget Section
array set GUI_Options {ExplorerFg #666699 ExplorerBg #EEEEEE
  ExplorerStandout #6BAAB2 ExplorerStandoutBg #046B75
  ExplorerHilightFg #000000 ExplorerHilightBg #FFFF00
  ExplorerLineFg #046B75 ExplorerLineBg #EEEEEE
  TooltipForeground #BBBAED TooltipBackground #666699
}

## System Window Options
array set GUI_Options {SystemBg #A0A0A0}

## Frame Widget Section
option add *Frame.Background #A0A0A0

## Label Widget Section
option add *Label.Foreground #000000
option add *Label.Background #A0A0A0

## Listbox Widget Section
option add *Listbox.Foreground  #666699
option add *Listbox.Background  #FFFFFF
option add *Listbox.selectForeground #BBBAED
option add *Listbox.selectBackground #666699

## Menu Widget Section
option add *Menu.Foreground       #000000
option add *Menu.Background       #808080
option add *Menu.activeForeground #BBBAED
option add *Menu.activeBackground #666699
option add *Menu.selectColor      #FFFF00

## MenuButton Widget Section
option add *Menubutton.Foreground       #000000
option add *Menubutton.Background       #808080
option add *Menubutton.activeForeground #BBBAED
option add *Menubutton.activeBackground #666699

## ScrollBar Widget Section
option add *Scrollbar.Background  #808080
option add *Scrollbar.troughColor #BFBFBF

## Spinbox Widget Section
option add *Spinbox.Foreground  #666699
option add *Spinbox.Background  #FFFFFF
option add *Spinbox.selectForeground #BBBAED
option add *Spinbox.selectBackground #666699
option add *Spinbox.activeForeground #BBBAED
option add *Spinbox.activeBackground #666699

## Text Widget Section
option add *Text.Foreground    #666699 
option add *Text.Background    #FFFFFF 
option add *Text.selectForeground    #BBBAED
option add *Text.selectBackground    #666699
array set GUI_Options {TextFg #666699 TextBg #FFFFFF}

## (BWidget) TitleFrame Widget Section
option add *TitleFrame.background #A0A0A0

## Progress Widget Section
option add *Progress.undoneForeground black                        
option add *Progress.undoneBackground white                        
option add *Progress.doneForeground   #BBBAED 
option add *Progress.doneBackground   #666699
if {[string equal $tcl_platform(platform) unix]} {
  source [file join $HomeDir share Themes Gradient MessageDlg.tcl]
}

## Module Images
foreach image {Inactive Active Enabled Run} {
  GUI_LoadImage IModule$image 1
}
set GUI_Options(ModuleImagePadX) 0
set GUI_Options(ModuleImagePadY) 0
source [file join $HomeDir GUI DrawModule.tcl]
