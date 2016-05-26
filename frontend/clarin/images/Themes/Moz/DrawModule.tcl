##
## This function creates a Module on a canvas. Modify with care...
##
##  The given x and y coordinates declare the centre of the module.
##  Don't forget to use the given tags. They will be used later in order
##  manipulate the module (move it, change its state, etc.)...
GUI_LoadImage ModuleImage
proc GUI_DrawModule {canvas module shape type state x y
      width height borderwidth fill_col outline_col tags
      text text_width text_padx text_pady text_col font justify
      text_anchor image_anchor text_tags
      image image_padx image_pady image_tags} {

  ## Has the Module registered a Draw Procedure of its own??
  if {![catch {creole_${module}_DrawModule $canvas $module $shape $type $state\
               $x $y \
               $width $height $borderwidth $fill_col $outline_col $tags \
               $text $text_width $text_padx $text_pady $text_col \
               $font $justify $text_tags \
               $image $image_padx $image_pady $image_tags}]} {return}
  
  switch -exact $type {
    {} -
    module {
      ## Draw Rectangle...
      set rx1 [expr {$x - $width  /2}]
      set ry1 [expr {$y - $height /2}]
      set rx2 [expr {$x + $width  /2}]
      set ry2 [expr {$y + $height /2}]
      
      $canvas create oval $rx1 $ry1 $rx2 $ry2 -fill $fill_col \
        -outline $outline_col -width $borderwidth -tags $tags
      $canvas create arc $rx1 $ry1 $rx2 $ry2 -fill #666699 \
        -outline $outline_col -width $borderwidth -tags $image_tags
      $canvas create arc $rx1 $ry1 $rx2 $ry2 -fill #BBBAED -start 270\
        -outline $outline_col -width $borderwidth -tags $image_tags

      ## Draw Image...
      if {[llength [info commands ModImg_$module]]} {
        $canvas create image [expr {$x+$image_padx}] [expr {$y+$image_pady}] \
           -image ModImg_$module -anchor $image_anchor -tags $image_tags
      } elseif {[string length $image]} {
        $canvas create image [expr {$x-14}] [expr {$y-14}] \
           -image ModuleImage -anchor $image_anchor -tags $image_tags
      }

      ## Draw the special pop-up handler...
      set hrx1 [expr {$rx2 - 12}]
      set hry1 [expr {$ry2 - 6- $borderwidth}]
      set hrx2 [expr {$rx2 - $borderwidth}]
      set hry2 [expr {$ry2 - 6- $borderwidth}]
      set hrx3 [expr {$rx2 - 6-$borderwidth/2}]
      set hry3 [expr {$ry2 - $borderwidth}]
      set hid [$canvas create polygon $hrx1 $hry1 $hrx2 $hry2 $hrx3 $hry3 \
        -fill {} -outline {} -width 1 -tags ${module}_all]
      $canvas bind ${module}_all <Enter> \
        "$canvas itemconfigure $hid -fill #b0c4de -outline #00bfff;\
         $canvas bind $hid <<MB_1>> \{set tkPriv(PrevX) \[$canvas canvasx %x\];\
                                      set tkPriv(PrevY) \[$canvas canvasy %y\];\
                                      GUI_SystemModulePopUp $canvas $module\}"
      $canvas bind ${module}_all <Leave> \
        "$canvas itemconfigure $hid -fill {} -outline {};\
         $canvas bind $hid <<MB_1>> {}"

      ## Draw Text...
      $canvas create text [expr {$x+$text_padx}] [expr {$y+$text_pady}] \
         -justify $justify -font $font -fill $text_col -width $text_width \
         -anchor $text_anchor -tags $text_tags -text $text
    }
    button {
      if {![winfo exists $canvas._button$module]} {
        button $canvas._button$module -text $text
        bind $canvas._button$module <<MB_2>> \
          "GUI_SystemModulePopUp $canvas $module"
        bind $canvas._button$module <<MB_M>> \
          "GUI_SystemModulePopUp $canvas $module"
        if {[llength [info commands ModImg_$module]]} {
          $canvas._button$module configure -image ModImg_$module -compound left
        }
      }
      $canvas create window $x $y -anchor c \
         -window $canvas._button$module -tags $tags
    }
    combobox {
      if {![winfo exists $canvas._combo$module]} {
        frame $canvas._combo$module \
          -bd $::GUI_Options(BorderWidth) -relief raised
        label $canvas._combo$module.label -text $text
        bind $canvas._combo$module.label <<MB_2>> \
          "GUI_SystemModulePopUp $canvas $module"
        ComboBox $canvas._combo$module.combobox
        if {[llength [info commands ModImg_$module]]} {
          $canvas._combo$module.label configure \
            -image ModImg_$module -compound left
        }
        ## Let the Initialisation routine to initialise the widget...
        catch {creole_${module}_Initialize {} {} \
          $canvas._combo$module.combobox $canvas._combo$module.label $canvas}
        grid $canvas._combo$module.label $canvas._combo$module.combobox \
          -padx 0 -pady 0 -sticky snew
        grid columnconfigure $canvas._combo$module 0 -weight 1
        grid columnconfigure $canvas._combo$module 1 -weight 1
      }
      $canvas create window $x $y -anchor nw \
         -window $canvas._combo$module -tags $tags
    }
    imageset {
      set item [$canvas create image $x $y \
                        -anchor center -tags [concat $tags $image_tags]]
      ## Let the Initialisation routine to initialise the widget...
      if {[catch {creole_${module}_Initialize {} {} $state \
                         $canvas $item $tags $image_tags} item_image]} {
        set item_image $image
      }
      if {![string length $item_image]} {
        GUI_LoadImage IFileBroken
        set item_image IFileBroken
      }
      $canvas itemconfigure $item -image $item_image
    }
    default {
      error "Unrecognised module type: $type"
    }
  }
}

##
## This function creates an Arc on a canvas. Modify with care...
##
##  Don't forget to use the given tags. They will be used later in order
##  manipulate the arc (move it, change its state, etc.)...
proc GUI_DrawArc {canvas points colour act_colour width act_width smooth tags} {
  eval $canvas create line $points -arrow last -fill $colour \
     -activefill $act_colour -width $width -activewidth $act_width \
     -smooth $smooth -tags [list $tags]
}
