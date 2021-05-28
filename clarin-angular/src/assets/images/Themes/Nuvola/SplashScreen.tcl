########################################################################
####### Crystal Splash Screen !!                              ##########
#######   Added by G. Petasis, 26/02/2002                     ##########
########################################################################

## GUT_ShowSplashWindow
#   Shows a splash screen!
proc LDM_ShowSplashWindow {} {
  if {!$::ApplicationInfo(EnableGUI) ||
      !$::ApplicationInfo(DisplaySplashScreen)} {return}
  global HomeDir SplashStatus GUI_Options
  set win .splashscr
  toplevel $win -bd 1 -relief flat -background black
  wm withdraw $win
  wm overrideredirect $win 1
  ## If application is embedded, don't insist on visibility...
  if {!$::ApplicationInfo(CDM_Embeded)} {
    bind $win <Visibility> [list raise $win]
  }

  ## Create Image and Center splash-window on screen...
  if {[catch {image create photo Splash -file [file join $HomeDir share Themes \
                                   Crystal EllogonSplash.gif]}]} {
    if {[catch {
      image create photo Splash -file \
            [file join $HomeDir share Themes Default EllogonSplash.gif]
      image create photo SplashActiveBar -file \
            [file join $HomeDir share Themes Default EllogonSplashAcBar.ppm]
      image create photo SplashInactiveBar -file \
            [file join $HomeDir share Themes Default EllogonSplashInBar.ppm]
    }]} {
      image create photo Splash
      image create photo SplashActiveBar
      image create photo SplashInactiveBar
    }
  } else {
    if {[catch {
      image create photo SplashActiveBar -file [file join $HomeDir share \
          Themes $GUI_Options(GUI_Theme) EllogonSplashAcBar.ppm]
      image create photo SplashInactiveBar -file [file join $HomeDir share \
          Themes $GUI_Options(GUI_Theme) EllogonSplashInBar.ppm]
      }]} {
        image create photo SplashActiveBar
        image create photo SplashInactiveBar
    }
  }
  set sw [winfo screenwidth  .]
  set sh [winfo screenheight .]
  set iw [image width  Splash]
  set ih [image height Splash]
  set x [expr {($sw-$iw)/2}]
  set y [expr {($sh-$ih)/2}]
  wm geometry $win +${x}+$y
  set w $win.fr
  frame $w -relief flat -bd 0 -background white
  canvas $w.image -width $iw -height $ih -bd 0 -highlightthickness 0 \
     -relief flat
  $w.image create image 0 0 -anchor nw -image Splash
  $w.image create text 20 235  -text {[Tcl]} -fill white -font {arial 9 bold}
  $w.image create text 60 235  -text {[C++]} -fill gray \
    -font {arial 9 bold} -tags cpp
  $w.image create text 105 235 -text {[Java]} -fill gray \
    -font {arial 9 bold} -tags java
  $w.image create text 150 235 -text {[Perl]} -fill gray \
    -font {arial 9 bold} -tags perl
  $w.image create text 205 235 -text {[Python]} -fill gray \
    -font {arial 9 bold} -tags python
  label $w.bar -background white -bd 0 -image SplashInactiveBar
  frame $w.progress -relief flat -background black -bd 1
    frame $w.progress.l -borderwidth 0 -background white -width 80
    frame $w.progress.l.fill -borderwidth 0 -background #0368d2
  place $w.progress.l.fill -x 0 -y 0 -relheight 1 -relwidth 0
  pack $w.progress.l -fill both -expand 1 -padx 0 -pady 0
  set SplashStatus { }
  label $w.label -textvariable SplashStatus -background white -foreground \
    #0368d2
  pack $w.image -side top -padx 0 -pady 0 -ipadx 0 -ipady 0
  pack $w.bar   -side top -padx 0 -pady 0 -ipadx 0 -ipady 0
  pack $w.progress -side right -fill y -expand 0 -padx 10 -pady 10
  pack $w.label -side left -fill x -expand 1 -pady 10
  pack $w -padx 0 -pady 0
  wm deiconify $win
  update
  wm geometry $win [wm geometry $win]
  return $win
};# LDM_ShowSplashWindow

## Set the status bar text in the splash window...
proc LDM_SetSplashWindowStatus { message {percent {}} {ImgWidth 0}} {
  if {!$::ApplicationInfo(EnableGUI) ||
      !$::ApplicationInfo(DisplaySplashScreen)} {return}
  if {[winfo exists .splashscr]} {
    if {[string length $percent]} {SetProgress .splashscr.fr.progress $percent}
    set ::SplashStatus $message
    set ImgWidth [expr {int($percent/100.0*[image width SplashInactiveBar])}]
    if {$percent > 95} {
      catch {SplashInactiveBar copy SplashActiveBar}
    } else {
      catch {SplashInactiveBar copy SplashActiveBar -from 0 0 $ImgWidth 60}
    }
    update
  }
};# LDM_SetSplashWindowStatus

## Notify the user about various things visually...
proc LDM_SplashWindowNotify {mode value} {
  switch -exact $mode {
    language {
      .splashscr.fr.image itemconfigure $value -fill white
    }
    default {}
  }
};# LDM_SplashWindowNotify
