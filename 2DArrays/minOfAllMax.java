public class minOfAllMax {
    public static void main(String[] args) {
       
        
        // int [] [] arr = {{1,2,3,4}, {5,6,7,8}, {9,10,11,12}};// 3 rows and 4 columns

        // int minOfMax = Integer.MAX_VALUE;

        // for(int i=0;i<arr.length;i++){
        //     int maxInRow = Integer.MIN_VALUE;
            
        //     for(int j=0;j<arr[0].length;j++){
        //         if(arr[i][j] > maxInRow){
        //             maxInRow = arr[i][j];
        //         }
        //     }
        //     if(maxInRow < minOfMax){
        //         minOfMax = maxInRow;
        //     }
        // }
        // System.out.println("min of all max:"+ minOfMax);







        // Snake Print 

        // int [] [] arr = {{1,2,3,4}, {5,6,7,8}, {9,10,11,12}};// 3 rows and 4 columns
        // for(int i=0;i<arr.length;i++){
        //     if(i%2==0){
        //         for(int j=0;j<arr[0].length;j++){
        //             System.out.print(arr[i][j] + " ");
        //         }
        //     }
        //     else{
        //         for(int j=arr[0].length-1;j>=0;j--){
        //             System.out.print(arr[i][j] + " ");
        //         }
        //     }
        //      System.out.println();
        // }



        // snake print in column wise
        // int [] [] arr = {{1,2,3,4}, {5,6,7,8}, {9,10,11,12}};// 3 rows and 4 columns
        // for(int j=0;j<arr[0].length;j++){
        //     if(j%2==0){
        //         for(int i=0;i<arr.length;i++){
        //             System.out.print(arr[i][j] + " ");
        //         }
        //     }
        //     else{
        //         for(int i=arr.length-1;i>=0;i--){
        //             System.out.print(arr[i][j] + " ");
        //         }
        //     }
        //      System.out.println();
        // }





        // ///// reverse the elements in the row
        // int [] [] arr = {{1,2,3,4}, {5,6,7,8}, {9,10,11,12}};// 3 rows and 4 columns
        // for(int i=0;i<arr.length;i++){
        //     int start = 0;
        //     int end = arr[0].length-1;
        //     while(start<end){
        //         int temp = arr[i][start];
        //         arr[i][start] = arr[i][end];
        //         arr[i][end] = temp;
        //         start++;
        //         end--;
        //     }
        // }
        // for(int i=0;i<arr.length;i++){
        //     for(int j=0;j<arr[0].length;j++){
        //         System.out.print(arr[i][j] + " ");
        //     }
        //     System.out.println();
        // }





                ///// reverse the elements in the column
        int [] [] arr = {{1,2,3,4}, {5,6,7,8}, {9,10,11,12}};// 3 rows and 4 columns
        for(int j=0;j<arr[0].length;j++){
            int start = 0;
            int end = arr.length-1;
            while(start<end){
                int temp = arr[start][j];
                arr[start][j] = arr[end][j];
                arr[end][j] = temp;
                start++;
                end--;
            }
        }
        for(int i=0;i<arr.length;i++){
            for(int j=0;j<arr[0].length;j++){
                System.out.print(arr[i][j] + " ");
            }
            System.out.println();
        }
    }

}

