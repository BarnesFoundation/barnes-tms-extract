import sys
import pprint
import cooperhewitt.roboteyes.colors.palette as palette

path = sys.argv[1]

# Where ref is a valid cooperhewitt.swatchbook color palette
ref = 'css4'

rsp = palette.extract_roygbiv(path, ref)
print pprint.pformat(rsp)