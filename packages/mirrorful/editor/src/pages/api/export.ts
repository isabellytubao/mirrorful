import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import { TColorData } from 'types'

const getKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>

// Our working directory is 2 levels below node_modules in production, so we go up 3 levels
export const rootPath =
  process.env.NODE_ENV === 'development'
    ? '../.mirrorful'
    : '../../../.mirrorful'

const generateStorageFile = async ({
  colorData,
}: {
  colorData: TColorData[]
}) => {
  await fs.writeFileSync(
    `${rootPath}/store.json`,
    JSON.stringify({ colorData })
  )
}

const generateCssFile = async ({ colorData }: { colorData: TColorData[] }) => {
  let primaryColor = colorData.find((c) => c.isPrimary)
  let secondaryColor = colorData.find((c) => c.isSecondary)

  let scssContent = ``
  let cssContent = `:root {\n`

  if (primaryColor) {
    cssContent += `  --color-primary: ${primaryColor.base};\n`
    if (primaryColor.hover) {
      cssContent += `  --color-primary-hover: ${primaryColor.hover};\n`
      scssContent += `$color-primary-hover: ${primaryColor.hover};\n`
    }

    if (primaryColor.active) {
      cssContent += `  --color-primary-active: ${primaryColor.active};\n`
      scssContent += `$color-primary-active: ${primaryColor.active};\n`
    }
  }

  if (secondaryColor) {
    cssContent += `  --color-secondary: ${secondaryColor.base};\n`
    if (secondaryColor.hover) {
      cssContent += `  --color-secondary-hover: ${secondaryColor.hover};\n`
      scssContent += `$color-secondary-hover: ${secondaryColor.hover};\n`
    }

    if (secondaryColor.active) {
      cssContent += `  --color-secondary-active: ${secondaryColor.active};\n`
      scssContent += `$color-secondary-active: ${secondaryColor.active};\n`
    }
  }

  colorData.forEach((color) => {
    scssContent += `$color-${color.name.toLowerCase()}: ${color.base};\n`
    cssContent += `  --color-${color.name.toLowerCase()}: ${color.base};\n`

    if (color.hover) {
      cssContent += `  --color-${color.name.toLowerCase()}-hover: ${
        color.hover
      };\n`
      scssContent += `$color-${color.name.toLowerCase()}-hover: ${
        color.hover
      };\n`
    }

    if (color.active) {
      cssContent += `  --color-${color.name.toLowerCase()}-active: ${
        color.active
      };\n`
      scssContent += `$color-${color.name.toLowerCase()}-active: ${
        color.active
      };\n`
    }

    if (color.shades) {
      getKeys(color.shades).forEach((key) => {
        if (color.shades) {
          cssContent += `  --color-${color.name.toLowerCase()}-${key}: ${
            color.shades[key]
          };\n`
          scssContent += `$color-${color.name.toLowerCase()}-${key}: ${
            color.shades[key]
          };\n`
        }
      })
    }
  })

  cssContent += `}\n`

  scssContent += `\n${cssContent}`

  await fs.writeFileSync(`${rootPath}/theme.css`, cssContent)
  await fs.writeFileSync(`${rootPath}/theme.scss`, scssContent)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = JSON.parse(req.body)

  await generateStorageFile({ colorData: body.colorData })
  await generateCssFile({ colorData: body.colorData })

  return res.status(200).json({ message: 'Success' })
}
