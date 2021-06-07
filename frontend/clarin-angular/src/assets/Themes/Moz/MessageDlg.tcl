image create photo {MessageDlg@TitleImage} -data {
R0lGODlhdQAgAMYAAC9vDzJxEjVzFTd1GDp2Gzx4Hj96IUF8JER9J0Z/KkmB
LUuDME6EMlCGNVOIOFWKO1iLPlqNQV2PRF+RR2KSSmWUTWeWUGqYU2yZVW+b
WHGdW3SfXnagYXmiZHukZ36maoCnbYOpcIWrc4itdoqueI2we4+yfpK0gZS1
hJe3h5q5ipy6jZ+8kKG+k6TAlqbBmKnDm6vFnq7HobDIpLPKp7XMqrjOrbrP
sL3Rs7/TtsLVucTWu8fYvsnawczcxM/dx9HfytThzdbj0Nnk09vm1t7o2eDq
3OPr3uXt4ejv5Orx5+3y6u/07fL28PT48/f59vn7+fz9/P//////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
/////////////////////////////////////////////////yH+Dk1hZGUg
d2l0aCBHSU1QACwAAAAAdQAgAAAH/oAAAQIDBAUGBwgJCgsMDQ4PEBESExQV
FhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFC
Q0RFRkdISUpLTE1OT1BRUtTV1tfY2dmChIaIioyOkJKUlpianJ6goqSmqKqs
rrCytLa4ury+wMLExsjKzJxBk6atoEFt3AodSrSo0aNIkypdyrSp06dQo0qd
SrWq1atYs2rdyrWr169gw4odS7as2bNo0w7KPJjQG8NwD8lJPFdRHcZ2G+F5
nBfSHsl8J/mp/NdSIMyZUBEOUvitoTiI5Sais7guozuO8T7SE3mvpD6U/VYC
dDkwZtS3/tRqLgTncFxEcxTTXWSn8V1HeSDrjcRncl9KfywDviQIF67cqjjt
ZuWptytQv2GJCi6L1HBaporbNnY81SbdqzrxbvXJ96tQwGONEj6rFPFap4xH
Q318sy7WnXm5/uwLdmhgskcLo12amO1T3btLz7Wa867Wnnu9Bv0rtuhgs0kP
q2262C10mtIh+059vfJw19w1I58d/nNz3ObPF+R9uvrk4Kxph5lxsX3X2XK2
kSeafuh1M11kv6mGnWXEvdbdZsnRJh5ozuXGoFQOqoeadZQJ19p2mR0nG3ie
MXdbeR8axB91kgG3WnaXFQebd5wpV9t4oT0X4zbp9TbifzdS/ghfigX2qKF9
Ly44JDYzQsheiQHmaKF8Kx74I4f4TUlkiEb6Z+OE76FIII8Z1ueigkKKWU2V
65EIII4VxqeigT5ueB+MclpD55FnunfigDtiSF+LCQbpYaCDmimhoQLqeOF8
LCIIZIf5yRlpjZOaWOmWezrpZqOcBipokf2B2p6oWurZZJuMbhqmqnGxSmOE
r2aZJ5NsLqopmIDi+imvWOK55JqKZvrln1KqeuyVdyqpZqKYeulnlHFCqquV
diaZJqKXdtknlHA+6um3dSKJ5qGWcsnnk2862qmY04b77qiyBuvstuneO2W+
7lIaK7DNaouuvbjmSmaryFY7brylF9I6LLTdrvvwrtSKCy+pswr7LLfqihkI
ADs=
====
}
proc MessageDlg {win args} {
  catch {destroy $win}
  global GUI_Text
  ## Parse arguments...
  foreach {anchor aspect background buttons default cancel font foreground
           icon justify message title type width padx pady parent} \
          {w 150 #1F2F50 {} -1 -1 {helvetica 12 italic bold} #FFFFFF
           none left {} {} 0 350 0 0 {}} {}
  foreach {opt val} $args {
    switch -glob -- $opt {
      -anchor        {set anchor $val}
      -aspect        {set aspect $val}
      -bg            -
      -background    {set background $val}
      -buttons       {set buttons $val}
      -default       {set default $val}
      -cancel        {set cancel $val}
      -font          {set font $val}
      -fg            -
      -foreground    {set foreground $val}
      -icon          {set icon $val}
      -justify       {set justify $val}
      -message       {set message $val}
      -title         {set title $val}
      -type          {set type $val}
      -width         {set width $val}
      -padx          {set padx $val}
      -pady          {set pady $val}
      -parent        {set parent $val}
      default {error "unkown option $opt"}
    }
  }
      
  toplevel $win -relief flat -bd 0 -bg $background -cursor left_ptr
  wm withdraw $win
  if {[string length $parent]} {
    wm transient $win $parent
  }
  bind $win <Enter> {focus %W}

  ## Window Title...
  frame $win.top -relief flat -bd 0
    frame $win.top.up1 -bg #9FE0A0 -height 2 -bd 0 -relief flat
    frame $win.top.up2 -bg #307010 -height 2 -bd 0 -relief flat
    frame $win.top.up3 -bg #20400F -height 2 -bd 0 -relief flat
    pack $win.top.up1 $win.top.up2 $win.top.up3 -fill x -expand 1
  grid $win.top -sticky snew
  frame $win.title -bg #307010 -relief flat -bd 0
    label $win.title.text -bg #307010 -fg #E0D74F -anchor w \
      -font {helvetica 12 italic bold} -text $title
    label $win.title.logo -bg #307010 -bd 0 -anchor e -image \
       {MessageDlg@TitleImage}
    pack $win.title.text -side left -fill x -expand 1 -padx 5 -pady 5
    pack $win.title.logo -side right
  grid $win.title -sticky snew
  
  ## Main Dialog area...
  frame $win.main -bg #1F2F50 -width 400 -height 200
    set defb  -1
    set canb  -1
    switch -- $type {
      abortretryignore {set lbut {abort retry ignore}}
      ok               {set lbut {ok}; set defb 0 }
      okcancel         {set lbut {ok cancel}; set defb 0; set canb 1}
      retrycancel      {set lbut {retry cancel}; set defb 0; set canb 1}
      yesno            {set lbut {yes no}; set defb 0; set canb 1}
      yesnocancel      {set lbut {yes no cancel}; set defb 0; set canb 2}
      user             {set lbut $buttons}
    }
    if {$default == -1} {set default $defb}
    if {$cancel  == -1} {set cancel $canb}
    if {![string length $title]} {set title Message...}
    if {![string equal $icon none]} {
      set image [Bitmap::get $icon]
    } else {
      set image {}
    } 
    
    frame $win.main.message -bg #1F2F50
      message $win.main.message.message -anchor $anchor -bg #1F2F50 \
        -font $font -foreground $foreground -padx $padx -pady $pady \
        -text $message -width $width -aspect $aspect -justify $justify
      label $win.main.message.icon -image $image -bg #1F2F50
      pack $win.main.message.icon -side left -padx 20 -pady 20
      pack $win.main.message.message -fill both -expand 1 -padx 20 -pady 20
    pack $win.main.message -side top -fill both -expand 1
    
    ## Button section...
    frame $win.main.buttons -bg #1F2F50
      set index 0
      foreach but $lbut {
        set text [string totitle $but]
        if {[info exists GUI_Text($text)]} {set text $GUI_Text($text)}
        button $win.main.buttons.b_$but -bg #307010 -fg #E0D74F -bd 1 \
          -font $font -text $text -highlightbackground #1F2F50 \
          -command "set GUI_DialogReplacement $index"
        if {$index == $default} {
          $win.main.buttons.b_$but configure -default active \
            -highlightbackground #A0AFD0
          bind $win <Return> "$win.main.buttons.b_$but invoke"
        }
        if {$index == $cancel} {
          bind $win <Escape> "$win.main.buttons.b_$but invoke"
        }
        incr index
        pack $win.main.buttons.b_$but -side left -padx 20
      }
    pack $win.main.buttons -side bottom -padx 20 -pady 10
  grid $win.main -sticky snew
  
  frame $win.bottom -relief flat -bd 0
    frame $win.bottom.bottom1 -bg #A0AFD0 -height 2 -bd 0 -relief flat
    frame $win.bottom.bottom2 -bg #708090 -height 2 -bd 0 -relief flat
    frame $win.bottom.bottom3 -bg #4F4750 -height 2 -bd 0 -relief flat
    pack $win.bottom.bottom1 $win.bottom.bottom2 $win.bottom.bottom3 \
      -fill x -expand 1
  grid $win.bottom -sticky snew
  grid rowconfigure $win 2 -weight 1
  grid columnconfigure $win 0 -weight 1

  ## Center Dialog in screen...
  update 
  set sw [winfo screenwidth  .]
  set sh [winfo screenheight .]
  set x [expr {($sw - [winfo reqwidth $win])/2}]
  set y [expr {($sh - [winfo reqheight $win])/2}]
  if {$x < 10 && $y < 10} {
    set x [expr {($sw - [winfo width $win])/2}]
    set y [expr {($sh - [winfo height $win])/2}]
  }
  wm geometry $win +${x}+$y
  update
  wm overrideredirect $win 1
  bind $win <Visibility> {raise %W}
  wm deiconify $win
  global GUI_DialogReplacement
  set grab [grab current]
  grab set $win
  focus $win
  foreach widget [list $win.title.text $win.title.logo] {
    bind $widget <ButtonPress-1> \
    "set wx \[winfo rootx $win\];set wy \[winfo rooty $win\];set X %X; set Y %Y"
    bind $widget <Button1-Motion> \
    "set dx \[expr %X - \$X\];set dy \[expr %Y - \$Y\]
     set nx \[expr {\$wx + \$dx}\];set ny \[expr {\$wy + \$dy}\]
     wm geometry $win +\$nx+\$ny"
  }
  tkwait variable GUI_DialogReplacement
  grab release $win
  if {[string length $grab]} {grab set $grab}

  ## The user respond. "Hide" the dialog...
  set x [winfo rootx $win]
  set y [winfo rooty $win]
  ## Choose a random effect
  if {rand() > 0.5} {
    for {set height [winfo height $win]; set width  [winfo width  $win]} \
        {$height > 0 && $width > 0} {incr height -25; incr width -50} {
      wm geometry $win ${width}x${height}+$x+$y
      update
      incr x 25; incr y 12
    }
  } else {
    for {set height [winfo height $win]; set width  [winfo width  $win]} \
        {$height > 0 && $width > 0} {incr height -22} {
      wm geometry $win ${width}x${height}+$x+$y
      update
      incr y 11
    }
  }
  destroy $win
  return $GUI_DialogReplacement
}
