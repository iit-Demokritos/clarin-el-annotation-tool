global GUI_Options HomeDir tcl_platform PANE
set GUI_Options(GUI_Theme) Nuvola

if {![info exists DoNotLoadImages]} {
  foreach file [glob $HomeDir/share/Themes/Nuvola/*.png] {
    set image [file root [file tail $file]]
    puts "Reloading Image: $file"
    if {[catch {image create photo $image -file \
      [file join $HomeDir share Themes Nuvola $image.png]}]} {
      GUI_LoadImage $image
    }
    if {[info exists GUI_Options(ImgLocation:$image)]} {
      set GUI_Options(ImgLocation:$image) [$image cget -file]
    }
  }
}

## Toolbar Options
array set GUI_Options {ToolbarHandleBackground #2368dd ToolbarBackground #73a6ff}

## System Window Options
array set GUI_Options {SystemBg #cfdefd
  ModuleTextInactive #0F36AD
  ModuleTextEnabled  #0F36AD
  ModuleTextActive   yellow
  ModuleTextRun      yellow
  ModuleImagePadX 0 ModuleImagePadY 0
}

## Module Images
after idle {
  foreach image {Inactive Active Enabled Run} {
    GUI_LoadImage IModule$image 1
    set GUI_Options(ModuleImage$image) [IModule$image cget -file]
  }
}

source [file join $HomeDir GUI DrawModule.tcl]
